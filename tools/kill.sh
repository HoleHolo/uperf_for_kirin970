#!/bin/sh
killall uperf
pkill -f "/data/adb/ksu/bin/busybox sh /data/adb/modules/uperf_for_kirin970/service.sh"