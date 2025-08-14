import { apiFetch, ApiError, ApiFetchOptions } from '../services/api';
import { useAppStore } from '../shared/store';

// Thin wrapper hook that returns a function mirroring apiFetch but pushing toast notifications on errors.
export function useApiWithToasts(){
  const pushToast = useAppStore(s=> s.pushToast);
  return async function fetchWithToasts(input: RequestInfo | URL, init?: ApiFetchOptions){
    try{
      return await apiFetch(input, init);
    }catch(e){
      if(e instanceof ApiError){
        pushToast({ variant: e.status >=500? 'error':'warning', title: e.status? `Error ${e.status}`: 'Network', message: e.message, timeoutMs: 6000 });
      } else {
        pushToast({ variant: 'error', title: 'Error', message: 'Unexpected failure', timeoutMs: 6000 });
      }
      throw e;
    }
  }
}
