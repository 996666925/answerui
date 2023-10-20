import create from 'zustand';

import type { UserInfoRes } from '@/common/interface';
import Storage from '@/utils/storage';
import { LOGGED_REFRESH_TOKEN_STORAGE_KEY, LOGGED_TOKEN_STORAGE_KEY } from '@/common/constants';

interface UserInfoStore {
  init: (loggedUserInfo: any) => void;
  user: UserInfoRes;
  update: (params: UserInfoRes) => void;
  clear: (removeToken?: boolean) => void;
}

const initUser: UserInfoRes = {
  user_id: '',
  access_token: '',
  username: '',
  avatar: '',
  rank: 0,
  bio: '',
  bio_html: '',
  display_name: '',
  location: '',
  website: '',
  status: 'normal',
  mail_status: 1,
  language: 'Default',
  is_admin: false,
  have_password: true,
  role_id: 1,
};

const loggedUserInfo = create<UserInfoStore>((set) => ({
  user: initUser,
  update: (params) => {
    if (typeof params !== 'object' || !params) {
      return;
    }
    if (!params?.language) {
      params.language = 'Default';
    }
    params.access_token = params.accessToken;

    let user = decryptJWT(params.access_token);
    params.username = user.Account;
    params.user_id = user.UserId;
    set(() => {
      Storage.set(LOGGED_TOKEN_STORAGE_KEY, params.accessToken);
      Storage.set(LOGGED_REFRESH_TOKEN_STORAGE_KEY, params.refreshToken)
      return { user: params };
    });
  },
  init(params) {
    let user = decryptJWT(params.accessToken);

    set(() => {
      params.username = user.Account;
      params.user_id = user.UserId;
      return { user: params };
    });
  },
  clear: (removeToken = true) =>
    set(() => {
      if (removeToken) {
        Storage.remove(LOGGED_TOKEN_STORAGE_KEY);
      }
      return { user: initUser };
    }),
}));

export default loggedUserInfo;

function decryptJWT(token: string): any {
  token = token.replace(/_/g, "/").replace(/-/g, "+");
  var json = decodeURIComponent(escape(window.atob(token.split(".")[1])));
  return JSON.parse(json);
}