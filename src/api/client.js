import axios from 'axios'
import store from '@/store'
import { getApiErrorMessage } from '@/helpers/apiFeedback'
import { emitApiRequestEnd, emitApiRequestStart } from '@/helpers/apiActionFeedback'

const CLIENT_ID = '1005'
const TOKEN_NAME_PREFIX = 'smart-sso-token-'
const TEMP_BYPASS_LOGIN = true

const toApiBase = (addr) => {
  if (!addr) return '/api'
  let base = String(addr).trim()
  base = base.replace(/\/+$/, '')
  if (base.toLowerCase().endsWith('/api')) return base
  return base + '/api'
}

const client = axios.create({
  baseURL: toApiBase(store.state.serverAddr)
})

function startRequest(config) {
  config.__iedApiFeedbackTracked = true
  store.commit('startApiRequest')
  emitApiRequestStart({ url: config.url, method: config.method })
}

function endRequest(config) {
  if (!config || !config.__iedApiFeedbackTracked) return
  config.__iedApiFeedbackTracked = false
  store.commit('endApiRequest')
  emitApiRequestEnd({ url: config.url, method: config.method })
}

function makeEnvelopeError(response, fallback) {
  const message = getApiErrorMessage({ response }, fallback)
  const error = new Error(message)
  error.response = response
  error.config = response?.config
  error.apiResponse = response?.data
  error.apiMessage = message
  return error
}

function rememberApiError(error, fallback) {
  const message = getApiErrorMessage(error, fallback)
  if (error && typeof error === 'object') error.apiMessage = message
  store.commit('setLastApiError', {
    message,
    status: error?.response?.status || null,
    url: error?.config?.url || error?.response?.config?.url || '',
    method: error?.config?.method || error?.response?.config?.method || ''
  })
  return error
}

client.interceptors.request.use(config => {
  startRequest(config)
  const accessToken = localStorage.getItem('accessToken' + CLIENT_ID)
  if (!config.headers) config.headers = {}
  if (accessToken) {
    config.headers[TOKEN_NAME_PREFIX + CLIENT_ID] = accessToken
  }
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  const lang = store.state.language || 'en-vi'
  config.headers['Accept-Language'] = lang
  return config
})

store.watch(
  (state) => state.serverAddr,
  (newAddr) => {
    client.defaults.baseURL = toApiBase(newAddr)
  }
)
function clearAuthAndRedirect() {
  if (TEMP_BYPASS_LOGIN) {
    // Temporary login bypass for UI work. Set TEMP_BYPASS_LOGIN to false to restore redirect.
    return;
  }

  try {
    localStorage.removeItem('accessToken' + CLIENT_ID);
    localStorage.removeItem('refreshToken' + CLIENT_ID);
  } catch (e) { "error" }
  store.commit('logout');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

client.interceptors.response.use(
  async (response) => {
    endRequest(response?.config)
    const res = response && response.data ? response.data : null;
    if (!res || typeof res.code === 'undefined') return response;
    if (res.code === 1) return response;

    // Chưa login || timeout
    if (res.code === 10) {
      clearAuthAndRedirect();
      return Promise.reject(rememberApiError(makeEnvelopeError(response, 'Not logged in')));
    }

    // at hết hạn / rt còn
    if (res.code === 15) {
      const refreshToken = localStorage.getItem('refreshToken' + CLIENT_ID);
      if (refreshToken) {
        try {
          const refreshResp = await client.get('/auth/sso/refresh-token', { params: { refreshToken }});
          const r = refreshResp.data || {};
          if (r.code === 1 && r.data && r.data.accessToken) {
            localStorage.setItem('accessToken' + CLIENT_ID, r.data.accessToken);
            if (r.data.refreshToken) {
              localStorage.setItem('refreshToken' + CLIENT_ID, r.data.refreshToken);
            }
            const cfg = { ...response.config };
            cfg.headers = cfg.headers || {};
            cfg.headers[TOKEN_NAME_PREFIX + CLIENT_ID] = r.data.accessToken;
            return client.request(cfg);
          }
        } catch (e) {
          // Fall-through to clear/redirect
        }
      }
      clearAuthAndRedirect();
      return Promise.reject(rememberApiError(makeEnvelopeError(response, 'Token expired')));
    }

    // No permission
    if (res.code === 20) {
      return Promise.reject(rememberApiError(makeEnvelopeError(response, 'No permission')));
    }

    return Promise.reject(rememberApiError(makeEnvelopeError(response, 'Request failed')));
  },
  (error) => {
    endRequest(error?.config)
    if (error && error.response && error.response.status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(rememberApiError(error));
  }
);
export default client
