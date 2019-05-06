//index.js
import CanvasDrag from '../../components/canvas-drag/canvas-drag';
var app = getApp();

function avatarHdUrl(imageUrl) {
  imageUrl = imageUrl.split('/');
  if (imageUrl[imageUrl.length - 1]) {
    imageUrl[imageUrl.length - 1] = 0;
  }
  imageUrl = imageUrl.join('/');
  console.log(imageUrl);
  return imageUrl;
}

const fsm = wx.getFileSystemManager();

const base64src = function(base64Png) {
  return new Promise((resolve, reject) => {
    let base64Data = base64Png.content, pngName = base64Png.name;
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64Data) || [];
    if (!format) {
      reject(new Error('ERROR_BASE64SRC_PARSE'));
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${pngName}.${format}`;
    const buffer = wx.base64ToArrayBuffer(bodyData);
    fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success() {
        resolve(filePath);
      },
      fail() {
        reject(new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  });
};

Page({
  data: {
    graph: {},
    decorators: []
  },
  onClick: function(e) {
    let addonPath = this.data.decorators[e.currentTarget.dataset.index];
    console.log(addonPath);
    if (addonPath.indexOf('border') !== -1) {
      // 是边框
      if (CanvasDrag.getBgBorder() === addonPath) {
        CanvasDrag.changeBgBorder('');
      }
       else {
         CanvasDrag.changeBgBorder(addonPath);
      }
    }
    else {
      // 是挂件
      wx.getImageInfo({
        src: addonPath,
        success: (res) => {
          this.setData({
            graph: {
              w: 120, h: 120 / res.width * res.height,
              type: 'image',
              url: addonPath
            }
          });
        }
      });

    }
  },
  onReady: function() {
    // 下载用户头像
    wx.showLoading({
      title: '加载中...',
      mask: true,
      success: () => {
        wx.downloadFile({
          url: avatarHdUrl(app.globalData.userInfo.avatarUrl),
          success: (res) => {
            CanvasDrag.changeBgImage(res.tempFilePath);
            this.setData({ avatarTempPath: res.tempFilePath});
            // 将所有base64转换为临时文件
            // borders
            let promises = [], index = 0;
            for (index in app.globalData.addon_data.borders) {
              promises.push(base64src(app.globalData.addon_data.borders[index]));
            }
            for (index in app.globalData.addon_data.decorators) {
              promises.push(base64src(app.globalData.addon_data.decorators[index]));
            }
            Promise.all(promises).then((values) => {
              console.log(values);
              this.setData({ decorators: values.sort() });
            });
            wx.hideLoading();
            
          }
        });
      },
      fail: (reason) => {
        wx.hideLoading();
        wx.showToast({
          title: '下载头像失败，请返回重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  onReset: function() {
    CanvasDrag.clearCanvas();
    CanvasDrag.changeBgImage(this.data.avatarTempPath);
  },
  onExport: function() {
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success: () => {
        CanvasDrag.export().then((res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res,
            success: () => {
              wx.showToast({
                title: '保存成功'
              });
            },
            fail: (reason) => {
              wx.showToast({
                title: reason.errMsg,
                icon: 'none'
              });
            }
          });
        });
      },
      fail: (reason) => {
        wx.showToast({
          title: '授权失败，请右上角‘关于’选项中授权',
          icon: 'none',
          duration: 4000
        });
      } 
    });
  }
});