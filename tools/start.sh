#!/bin/sh
DIR=${0%/*}
sh "$DIR/kill.sh"
sh "$DIR/../service.sh"