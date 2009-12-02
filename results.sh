#!/bin/sh
process=`ps -ef | grep storm-client | grep -v grep | awk '{print $2}'`
kill -QUIT $process
