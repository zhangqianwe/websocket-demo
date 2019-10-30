package com.gj.sendall;

import javax.websocket.Session;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-11 12:53
 * @Description:
 */
public class SysMemory {
    public final static Map<String, String> clients = new ConcurrentHashMap<String, String>();
    public final static CopyOnWriteArraySet<Session> SessionSet = new CopyOnWriteArraySet<Session>();
}
