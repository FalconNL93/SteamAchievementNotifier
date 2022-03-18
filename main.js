const { app, BrowserWindow, Menu, Tray, nativeImage, nativeTheme, ipcMain, dialog, desktopCapturer } = require('electron');

const path = require('path');
const fs = require('fs');
const shell = require('electron').shell;

const sanlocalappdata = path.join(process.env.LOCALAPPDATA,"Steam Achievement Notifier (V1.8)");
if (!fs.existsSync(sanlocalappdata)) {
   console.log("\"Steam Achievement Notifier (V1.8)\" directory does not exist in %LOCALAPPDATA%. Creating...");
   fs.mkdirSync(sanlocalappdata);
   fs.mkdirSync(path.join(sanlocalappdata,"store"));
   fs.mkdirSync(path.join(sanlocalappdata,"img"));
   fs.copyFileSync(path.join(__dirname,"store","config.json"), path.join(sanlocalappdata,"store","config.json"));
   fs.copyFileSync(path.join(__dirname,"img","sanlogo.ico"), path.join(sanlocalappdata,"img","sanlogo.ico"));
   // fs.copyFileSync(path.join(__dirname,"store","san1.8.js"), path.join(sanlocalappdata,"store","san1.8.js"));
   // fs.copyFileSync(path.join(__dirname,"store","tooltip.js"), path.join(sanlocalappdata,"store","tooltip.js"));
   console.log("\"Steam Achievement Notifier (V1.8)\" directory created in %LOCALAPPDATA%. WARNING: \"config.json\" has been reset to Default.")
// } else if (!fs.existsSync(path.join(sanlocalappdata,"store","san1.8.js"))) {
//    fs.copyFileSync(path.join(__dirname,"store","san1.8.js"), path.join(sanlocalappdata,"store","san1.8.js"));
//    fs.copyFileSync(path.join(__dirname,"store","tooltip.js"), path.join(sanlocalappdata,"store","tooltip.js"));
//    console.log("\"san1.8.js\"/\"tooltip.js\" copied to %LOCALAPPDATA%/Steam Achievement Notifier (V1.8)/store.");
} else {
   console.log("\"Steam Achievement Notifier (V1.8)\" directory already exists.")
}

const config = JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA,"Steam Achievement Notifier (V1.8)","store","config.json")));

// app.disableHardwareAcceleration() massively reduces memory usage on integrated graphics
// Allows manual garbage collection via "gc()"
if (config.hwa == "true") {
   console.log("No HWA")

   app.disableHardwareAcceleration();
   app.commandLine.appendSwitch('js-flags', '--expose_gc --max-old-space-size=128');
   require("v8").setFlagsFromString('--expose_gc');
   global.gc = require("vm").runInNewContext('gc');
      
   // Garbage collected every minute
   setInterval(function() {
      gc();
   }, 60000);
}

let win;
let tray = null;
var ver = "1.81";

function createWindow() {
   win = new BrowserWindow({
      width: 700,
      height: 500,
      transparent: true,
      autoHideMenuBar: true,
      frame: false,
      center: true,
      title: "Steam Achievement Notifier (V" + ver + ")",
      icon: (path.join(__dirname, "img","sanlogo.ico")),
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
         enableRemoteModule: true,
         backgroundThrottling: false,
         webviewTag: true
      }
   })
   win.loadFile(path.join(__dirname, "index.html"));
   win.on('close', function(action) {
      action.preventDefault();
      win.hide();
   });
   win.once('ready-to-show', function() {
      try {
         if (config.startmin == "true") {
            win.hide();
         } else {
            win.show();
         }
      } catch {
         win.show();
      }
   
      const appLock = app.requestSingleInstanceLock();

      if (appLock) {
         app.on('second-instance', function() {
            app.exit();
         });
      }
   });
}

var offsetx;
var offsety;

var display;

app.whenReady().then(function(){
   const { screen } = require('electron');
   const primaryDisplay = screen.getPrimaryDisplay().bounds;

   display = primaryDisplay;
});

ipcMain.on('trackwin', function(event, gamename) {
   var trackx = display.width - 185;
   var tracky = display.height - 85;

   const trackwin = new BrowserWindow({
      width: 165,
      height: 65,
      title: 'trackwin',
      center: true,
      show: true,
      frame: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      movable: false,
      fullscreenable: false,
      focusable: false,
      //alwaysOnTop: true,
      skipTaskbar: true,
      transparent: true,
      x: trackx,
      y: tracky,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
         enableRemoteModule: true,
         backgroundThrottling: false
      }
   });
   trackwin.setIgnoreMouseEvents(true);
   trackwin.setAlwaysOnTop(true, 'screen-saver');

   trackwin.loadFile("./notify/track/track.html");

   trackwin.once('ready-to-show', function() {
      trackwin.show();
      trackwin.webContents.send('track', gamename);
   });
   ipcMain.on('trackstop', function() {
      trackwin.destroy();
   });
});

ipcMain.on('notifywin', function(event, queueobj) {
   var config = JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA,"Steam Achievement Notifier (V1.8)","store","config.json")));

   var width = queueobj.width * queueobj.scale * 0.01;
   var height = queueobj.height * queueobj.scale * 0.01;
   width = Math.round(width);
   height = Math.round(height);

   if (queueobj.pos == "bottomcenter") {
      if (queueobj.style == "default") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width * 0.5 - (150 * queueobj.scale * 0.01);
            offsety = display.height - ((219 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width * 0.5 - (150 * queueobj.scale * 0.01);
            offsety = display.height - ((50 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "xbox") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width * 0.5 - (157 * queueobj.scale * 0.01);
            offsety = display.height - ((239 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width * 0.5 - (157 * queueobj.scale * 0.01);
            offsety = display.height - ((65 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "playstation") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width * 0.5 - (155 * queueobj.scale * 0.01);
            offsety = display.height - (224 * queueobj.scale * 0.01);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width * 0.5 - (155 * queueobj.scale * 0.01);
            offsety = display.height - (55 * queueobj.scale * 0.01);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "ps5") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width * 0.5 - (170 * queueobj.scale * 0.01);
            offsety = display.height - (239 * queueobj.scale * 0.01);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width * 0.5 - (170 * queueobj.scale * 0.01);
            offsety = display.height - (70 * queueobj.scale * 0.01);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "windows") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width * 0.5 - (150 * queueobj.scale * 0.01);
            offsety = display.height - ((279 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width * 0.5 - (150 * queueobj.scale * 0.01);
            offsety = display.height - ((110 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      }
   } else if (queueobj.pos == "topcenter") {
      if (queueobj.style == "default") {
         offsetx = display.width * 0.5 - (150 * queueobj.scale * 0.01);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "xbox") {
         offsetx = display.width * 0.5 - (157 * queueobj.scale * 0.01);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "playstation") {
         offsetx = display.width * 0.5 - (155 * queueobj.scale * 0.01);
         offsety = 0;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "ps5") {
         offsetx = display.width * 0.5 - (170 * queueobj.scale * 0.01);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "windows") {
         offsetx = display.width * 0.5 - (150 * queueobj.scale * 0.01);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      }
   } else if (queueobj.pos == "topleft") {
      if (queueobj.style == "default") {
         offsetx = 20;
         offsety = 20;
      } else if (queueobj.style == "xbox") {
         offsetx = 20;
         offsety = 20;
      } else if (queueobj.style == "playstation") {
         offsetx = 0;
         offsety = 100;
      } else if (queueobj.style == "ps5") {
         offsetx = 0;
         offsety = 20;
      } else if (queueobj.style == "windows") {
         offsetx = 20;
         offsety = 20;
      }
   } else if (queueobj.pos == "topright") {
      if (queueobj.style == "default") {
         offsetx = display.width - ((300 * queueobj.scale * 0.01) + 20);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "xbox") {   
         offsetx = display.width - ((315 * queueobj.scale * 0.01) + 20);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "playstation") {
         offsetx = display.width - (310 * queueobj.scale * 0.01);
         offsety = 100;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "ps5") {
         offsetx = display.width - (340 * queueobj.scale * 0.01);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      } else if (queueobj.style == "windows") {
         offsetx = display.width - ((300 * queueobj.scale * 0.01) + 20);
         offsety = 20;
         offsetx = Math.round(offsetx);
         offsety = Math.round(offsety);
      }
   } else if (queueobj.pos == "bottomleft") {
      if (queueobj.style == "default") {
         if (queueobj.screenshot == "true") {
            offsetx = 20;
            offsety = display.height - ((219 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = 20;
            offsety = display.height - ((70 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "xbox") {
         if (queueobj.screenshot == "true") {
            offsetx = 20;
            offsety = display.height - ((239 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = 20;
            offsety = display.height - ((65 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "playstation") {
         if (queueobj.screenshot == "true") {
            offsetx = 0;
            offsety = display.height - ((224 * queueobj.scale * 0.01) + 100);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = 0;
            offsety = display.height - ((55 * queueobj.scale * 0.01) + 100);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "ps5") {
         if (queueobj.screenshot == "true") {
            offsetx = 0;
            offsety = display.height - ((219 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = 0;
            offsety = display.height - ((50 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "windows") {
         if (queueobj.screenshot == "true") {
            offsetx = 20;
            offsety = display.height - ((279 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = 20;
            offsety = display.height - ((110 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      }
   } else if (queueobj.pos == "bottomright") {
      if (queueobj.style == "default") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width - ((300 * queueobj.scale * 0.01) + 20);
            offsety = display.height - ((219 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width - ((300 * queueobj.scale * 0.01) + 20);
            offsety = display.height - ((50 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "xbox") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width - ((315 * queueobj.scale * 0.01) + 20);
            offsety = display.height - ((239 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width - ((315 * queueobj.scale * 0.01) + 20);
            offsety = display.height - ((65 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "playstation") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width - (310 * queueobj.scale * 0.01);
            offsety = display.height - ((224 * queueobj.scale * 0.01) + 100);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width - (310 * queueobj.scale * 0.01);
            offsety = display.height - ((55 * queueobj.scale * 0.01) + 100);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "ps5") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width - (340 * queueobj.scale * 0.01);
            offsety = display.height - ((219 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width - (340 * queueobj.scale * 0.01);
            offsety = display.height - ((50 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      } else if (queueobj.style == "windows") {
         if (queueobj.screenshot == "true") {
            offsetx = display.width - ((300 * queueobj.scale * 0.01) + 20);
            offsety = display.height - ((279 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         } else {
            offsetx = display.width - ((300 * queueobj.scale * 0.01) + 20);
            offsety = display.height - ((110 * queueobj.scale * 0.01) + 20);
            offsetx = Math.round(offsetx);
            offsety = Math.round(offsety);
         }
      }
   } else {
      console.log("Error! Could not place notification. X: 0, Y: 0");
      offsetx = 0
      offsety = 0
   }
   
   const notifywin = new BrowserWindow({
      width: width,
      height: height,
      title: 'notifywin',
      center: true,
      show: true,
      frame: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      movable: false,
      fullscreenable: false,
      focusable: false,
      //alwaysOnTop: true,
      skipTaskbar: true,
      transparent: true,
      x: offsetx,
      y: offsety,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
         enableRemoteModule: true,
         backgroundThrottling: false
      }
   });
   notifywin.setIgnoreMouseEvents(true);
   notifywin.setAlwaysOnTop(true, 'screen-saver');

   var notifysrc;

   if (queueobj.type == "main") {
      if (queueobj.style == "default") {
         notifysrc = path.join(__dirname,"notify","default","main","default.html");
      } else if (queueobj.style == "xbox") {
         notifysrc = path.join(__dirname,"notify","xbox","main","xbox.html");
      } else if (queueobj.style == "playstation") {
         notifysrc = path.join(__dirname,"notify","playstation","main","playstation.html");
      } else if (queueobj.style == "ps5") {
         notifysrc = path.join(__dirname,"notify","ps5","main","ps5.html");
      } else if (queueobj.style == "windows") {
         notifysrc = path.join(__dirname,"notify","windows","main","windows.html");
      }
   } else {
      if (queueobj.style == "default") {
         notifysrc = path.join(__dirname,"notify","default","rare","defaultrare.html");
      } else if (queueobj.style == "xbox") {
         notifysrc = path.join(__dirname,"notify","xbox","rare","xboxrare.html");
      } else if (queueobj.style == "playstation") {
         notifysrc = path.join(__dirname,"notify","playstation","rare","playstationrare.html");
      } else if (queueobj.style == "ps5") {
         notifysrc = path.join(__dirname,"notify","ps5","rare","ps5rare.html");
      } else if (queueobj.style == "windows") {
         notifysrc = path.join(__dirname,"notify","windows","rare","windowsrare.html");
      }
   }

   notifywin.loadFile(notifysrc);

   if (config.screenshot == "true" || config.rarescreenshot == "true") {
      desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 852, height: 480 }}).then(function(sources) {
         fs.writeFileSync(path.join(__dirname,"img","ss.png"), sources[0].thumbnail.toPNG());
      });
   }

   notifywin.once('ready-to-show', function() {
      notifywin.show();
      notifywin.webContents.send('notifymain', queueobj.achievement, queueobj.title, queueobj.desc, queueobj.icon, queueobj.screenshot, queueobj.percent, queueobj.audio);
      //notifywin.webContents.openDevTools({ mode: 'detach' })
   });
   ipcMain.once('notifywinstop', function() {
      notifywin.destroy();
      win.webContents.send('notrunning');
   });
});

var traylabel;
var trayshow;
var trayexit;

app.whenReady().then(function() {
   tray = new Tray(path.join(__dirname,"img","sanlogo.ico"));

   const menuTemplate = [
      {
         label: traylabel,
         icon: nativeImage.createFromPath(path.join(__dirname,"icons","dot_red.png")).resize({ width:16 }),
         enabled: false
      },
      {
         label: "",
         type: "separator"
      },
      {
         label: trayshow,
         icon: nativeImage.createFromPath(path.join(__dirname,"img","show.png")).resize({ width:16 }),
         click: function() {
            win.show();
         }
      },
      {
         label: trayexit,
         icon: nativeImage.createFromPath(path.join(__dirname,"img","close.png")).resize({ width:16 }),
         click: function() {
            app.exit(0);
         }
      }
   ];
   
   const contextMenu = Menu.buildFromTemplate(menuTemplate);
   tray.setToolTip("Steam Achievement Notifier (V" + ver + ")");
   tray.setContextMenu(contextMenu);
   tray.on('double-click', function() {
      win.show();
   });
   ipcMain.on('changelang', function(event, traylabel, trayshow, trayexit) {
      const menuTemplate = [
         {
            label: traylabel,
            icon: nativeImage.createFromPath(path.join(__dirname,"icons","dot_red.png")).resize({ width:16 }),
            enabled: false
         },
         {
            label: "",
            type: "separator"
         },
         {
            label: trayshow,
            icon: nativeImage.createFromPath(path.join(__dirname,"img","show.png")).resize({ width:16 }),
            click: function() {
               win.show();
            }
         },
         {
            label: trayexit,
            icon: nativeImage.createFromPath(path.join(__dirname,"img","close.png")).resize({ width:16 }),
            click: function() {
               app.exit(0);
            }
         }
      ];
      const contextMenu = Menu.buildFromTemplate(menuTemplate);
      tray.setToolTip("Steam Achievement Notifier (V" + ver + ")");
      tray.setContextMenu(contextMenu);
      tray.on('double-click', function() {
         win.show();
      });
   });
   ipcMain.on('track', function(event, gamename, trayshow, trayexit) {
      var gamenamelbl = gamename;
      if (gamenamelbl.length > 25) {
         gamenamelbl = gamenamelbl.substring(0, 25) + "...";
      }
      const menuTemplate = [
         {
            label: `${gamenamelbl}`,
            icon: nativeImage.createFromPath(path.join(__dirname,"icons","dot_green.png")).resize({ width:16 }),
            enabled: false
         },
         {
            label: "",
            type: "separator"
         },
         {
            label: trayshow,
            icon: nativeImage.createFromPath(path.join(__dirname,"img","show.png")).resize({ width:16 }),
            click: function() {
               win.show();
            }
         },
         {
            label: trayexit,
            icon: nativeImage.createFromPath(path.join(__dirname,"img","close.png")).resize({ width:16 }),
            click: function() {
               app.exit(0);
            }
         }
      ];
      const contextMenu = Menu.buildFromTemplate(menuTemplate);
      tray.setToolTip("Steam Achievement Notifier (V" + ver + ")");
      tray.setContextMenu(contextMenu);
   });
   ipcMain.on('idle', function(event, traylabel, trayshow, trayexit) {
      const menuTemplate = [
         {
            label: traylabel,
            icon: nativeImage.createFromPath(path.join(__dirname,"icons","dot_red.png")).resize({ width:16 }),
            enabled: false,
         },
         {
            label: "",
            type: "separator"
         },
         {
            label: trayshow,
            icon: nativeImage.createFromPath(path.join(__dirname,"img","show.png")).resize({ width:16 }),
            click: function() {
               win.show();
            }
         },
         {
            label: trayexit,
            icon: nativeImage.createFromPath(path.join(__dirname,"img","close.png")).resize({ width:16 }),
            click: function() {
               app.exit(0);
            }
         }
      ];
      const contextMenu = Menu.buildFromTemplate(menuTemplate);
      tray.setToolTip("Steam Achievement Notifier (V" + ver + ")");
      tray.setContextMenu(contextMenu);
   });
});

ipcMain.on('reset', function(e, options) {
   var resetoptions = options;

   var msg = dialog.showMessageBoxSync(win, resetoptions)
   if (msg == 0) {
      win.webContents.send('resetapp');
   } else if (msg == 1) {
      win.webContents.send('uninstallapp');
   }
});

ipcMain.on('resetcomplete', function() {
   app.relaunch({ execPath: process.env.PORTABLE_EXECUTABLE_FILE });
   app.exit();
});

ipcMain.on('uninstallcomplete', function() {
   app.exit();
});

ipcMain.on('openapilink', function() {
   shell.openExternal("https://steamcommunity.com/login/home/?goto=%2Fdev%2Fapikey");
});

ipcMain.on('opensteam64link', function() {
   shell.openExternal("https://steamid.io/lookup");
});

ipcMain.on('kofi', function() {
   shell.openExternal("https://ko-fi.com/steamachievementnotifier");
});

ipcMain.on('discord', function() {
   shell.openExternal("https://discord.gg/FxCFtpd3eu");
});

ipcMain.on('report', function() {
   shell.openExternal("https://github.com/SteamAchievementNotifier/SteamAchievementNotifier/issues");
});

ipcMain.on('update', function(event, args) {
   var tag = args;
   shell.openExternal(`https://github.com/SteamAchievementNotifier/SteamAchievementNotifier/releases/tag/${tag}`);
});

ipcMain.on('reloadapp', function() {
   win.webContents.reloadIgnoringCache();
});

nativeTheme.themeSource = "dark";

// const appLock = app.requestSingleInstanceLock();

// if (!appLock) {
//    app.exit();
// } else {
//    app.on('second-instance', function() {
//       if (win) {
//          win.show();
//          win.focus();
//       }
//    });
// }

app.on('ready', createWindow);