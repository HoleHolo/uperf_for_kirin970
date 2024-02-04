#!/bin/sh

# 获取当前模块目录
MODDIR=${0%/*}
echo "当前目录：$MODDIR"

# 载入模块配置
source "$MODDIR/config.prop" || exit 1

# 等待完成文件系统解密
while true; do
    if [ -d /storage/emulated/0/Android/data ]; then
        break
    fi
    sleep 10
done

# 若不存在则复制模式切换文件
[ ! -d "$switch_dir" ] && mkdir "$switch_dir"
[ ! -f "$switch_dir/cur_powermode.txt" ] && cp "$MODDIR/data-files/cur_powermode.txt" "$switch_dir"
[ ! -f "$switch_dir/perapp_powermode.txt" ] && cp "$MODDIR/data-files/perapp_powermode.txt" "$switch_dir"

# 防止 Uperf 多次运行
pgrep uperf &> /dev/null && echo "检测到 Uperf 进程，结束中..." && killall uperf

# 防止服务脚本多次运行
sh_pid=$(pgrep -f "$MODDIR/service.sh")
if [ "$sh_pid" != "" ]; then
    echo "检测到原服务进程，结束中..."
    sh_array=($(echo $sh_pid | tr '\n' ' '))
    for i in ${sh_array[@]}; do
        [[ "$i" != "$$" ]] && pkill $i
    done
fi

# 应用模块配置创建运行时调度配置
rm -rf "$MODDIR/uperf_config_running.json"
sed -e "s|\$switch_dir|$switch_dir|g" "$MODDIR/uperf_config.json" > "$MODDIR/uperf_config_running.json"
sed -e "s/\$log_level/$log_level/g" -i "$MODDIR/uperf_config_running.json"
sed -e "s/\$sf/$sf/g" -i "$MODDIR/uperf_config_running.json"

# 启动模块服务函数
start_uperf () {
    if [ $log == false ]; then
        "$MODDIR/uperf" "$MODDIR/uperf_config_running.json"
    elif [ $log == true ]; then
        "$MODDIR/uperf" -o "$log_path" "$MODDIR/uperf_config_running.json"
    else
        exit 2
    fi
}

# 启动调度的具体流程
if [ $reload == true ]; then
    while true; do
        start_uperf
        sleep "$time"
    done
elif [ $reload == false ]; then
    start_uperf
else
    exit 3
fi
