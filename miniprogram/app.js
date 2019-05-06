"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
App({
    onLaunch: function () {
      // 初始化云存储
        wx.cloud.init({
            env: "yidiandian-canvas"
        });
    },
    globalData: {
      addon_data: {}
    }
});
