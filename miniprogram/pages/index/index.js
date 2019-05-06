var app = getApp();

Page({
    data: {
      loaded: false
    },
  loadLocalAddonData: function() {
    let path = wx.getStorageSync('addon_data_path');
    wx.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'ascii',
      success: (res) => {
        app.globalData.addon_data = JSON.parse(res.data);
        console.log(app.globalData.addon_data);
        this.setData({ loaded: true });
        wx.hideLoading();
      },
      fail: (reason) => {
        wx.hideLoading();
        wx.showToast({
          title: reason,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
    onReady: function() {
      wx.showLoading({
        title: '加载中...',
        mask: true,
        success: () => {
          // 检查本地是否存在保存过的挂件
          wx.getStorage({
            key: 'addon_data_path',
            success: (res) => {
              // 找到了本地文件
              this.loadLocalAddonData();
            },
            fail: (reason) => {
              // 未找到，则下载
              wx.cloud.downloadFile({
                fileID: "cloud://yidiandian-canvas.7969-yidiandian-canvas/addon_data",
              }).then((res) => {
                // 下载成功，保存为本地文件并记录路径
                wx.getSavedFileList({
                  success: (res) => {
                    for (let index in res.fileList) {
                      console.log(res.fileList[index].filePath);
                      wx.removeSavedFile({
                        filePath: res.fileList[index].filePath
                      });
                    }
                  }
                });
                wx.saveFile({
                  tempFilePath: res.tempFilePath,
                  success: (res) => {
                    // 保存成功，记录键值
                    wx.clearStorage();
                    wx.setStorageSync('addon_data_path', res.savedFilePath);
                    this.loadLocalAddonData();
                  },
                  fail: (reason) => {
                    // 保存失败，显示错误
                    wx.hideLoading();
                    wx.showToast({
                      title: reason.errMsg,
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              }, (reason) => {
                // 下载失败
                wx.hideLoading();
                wx.showToast({
                  title: '下载出错，检查网络连接并重启小程序',
                  icon: "none",
                  duration: 3000
                });
              });
            }
          });
        }
      });
    },
    onGetUserInfo: function(e) {
      if (!e.detail.userInfo) {}
      else {
        app.globalData.userInfo = e.detail.userInfo;
        wx.navigateTo({
          url: '../canvas/canvas'
        });
      }
    }
});
