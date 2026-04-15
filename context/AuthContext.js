import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// 1. Cấu hình ID App của bạn ở đây (Lấy từ app.json)
const FB_APP_ID = "884335144349241"; // <--- THAY APP ID CỦA BẠN VÀO ĐÂY (chỉ số, không có chữ fb)

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);

  // --- PHẦN KHỞI TẠO ---
  useEffect(() => {
    if (Platform.OS === 'web') {
      // A. Nếu là Web: Tải Facebook SDK cho Web
      window.fbAsyncInit = function() {
        window.FB.init({
          appId      : FB_APP_ID,
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
      };
      // Tải script từ server Facebook về
      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "https://connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
    } else {
      // B. Nếu là App: Khởi tạo Native SDK (giữ nguyên code cũ)
      try {
        const { Settings } = require('react-native-fbsdk-next');
        Settings.initializeSDK();
      } catch (e) {}
    }
  }, []);

  // --- HÀM ĐĂNG NHẬP FACEBOOK (ĐA NĂNG) ---
  const loginFacebook = async () => {
    // === XỬ LÝ CHO WEB ===
    if (Platform.OS === 'web') {
        return new Promise((resolve) => {
            if (!window.FB) {
                Alert.alert("Lỗi", "Chưa tải xong Facebook SDK, vui lòng đợi 1 chút rồi bấm lại!");
                return resolve(false);
            }
            // Gọi hàm đăng nhập chuẩn của Web
            window.FB.login(function(response) {
                if (response.authResponse) {
                    // Lấy thông tin user
                    window.FB.api('/me', {fields: 'name, picture, email'}, function(profile) {
                        setUser({
                            name: profile.name,
                            avatar: profile.picture.data.url,
                            type: 'facebook',
                            id: profile.id
                        });
                        resolve(true);
                    });
                } else {
                    console.log('User huỷ đăng nhập');
                    resolve(false);
                }
            }, {scope: 'public_profile,email'});
        });
    }

    // === XỬ LÝ CHO ĐIỆN THOẠI (Native) ===
    try {
      const { LoginManager, AccessToken, Profile } = require('react-native-fbsdk-next');
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) return false;

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) return false;

      const currentProfile = await Profile.getCurrentProfile();
      if (currentProfile) {
        setUser({
          name: currentProfile.name,
          avatar: currentProfile.imageURL,
          type: 'facebook',
          id: currentProfile.userID
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log('Lỗi Native:', error);
      Alert.alert('Lỗi', 'Cần chạy trên máy thật để test tính năng này');
      return false;
    }
  };

  const logout = () => {
    if (Platform.OS === 'web' && window.FB) {
        window.FB.logout();
    } else {
        try { require('react-native-fbsdk-next').LoginManager.logOut(); } catch(e){}
    }
    setUser(null);
  };

  // Các hàm khác giữ nguyên
  const login = (email, pass) => { setUser({ name: 'Admin', avatar: null }); return true; };
  const loginZalo = async () => { 
      return new Promise((resolve) => {
        setTimeout(() => {
          setUser({ name: 'Người dùng Zalo', avatar: 'https://s120-ava-talk.zadn.vn/c/5/f/0/1/120/12345.jpg', type: 'zalo' });
          resolve(true);
        }, 1000);
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, loginFacebook, loginZalo, logout, isLoginModalVisible, setLoginModalVisible }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);