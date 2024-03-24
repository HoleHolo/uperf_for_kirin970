#!/bin/bash
[[ $(getprop ro.boot.hardware) == "kirin970" ]] || abort "! 抱歉，本脚本不支持您的处理器。"
[[ -d /sys/devices/platform/e82c0000.mali ]] || abort "! 抱歉，本脚本不支持您的 GPU。"
ui_print "- 设置权限"
chmod -R 644 "$MODPATH/*"
chmod 755 "$MODPATH/service.sh" "$MODPATH/uperf" "$MODPATH/data-files" "$MODPATH/tools"; chmod -R 755 "$MODPATH/tools/*"
ui_print "- 如果您需要更改模块配置，请修改模块
目录下的 config.prop，或者修改模块
压缩包中的相应文件后重新安装。"
