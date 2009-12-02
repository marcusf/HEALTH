kill -QUIT `ps -ef | grep storm-client | grep -v grep | awk '{print $2}'`
