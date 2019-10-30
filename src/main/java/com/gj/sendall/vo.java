package com.gj.sendall;

import javax.websocket.Session;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-11 14:36
 * @Description:
 */
public class vo {
    public String sessionId;
    public Session session;
    private String name;
    private WebSocket webSocket;

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public WebSocket getWebSocket() {
        return webSocket;
    }

    public void setWebSocket(WebSocket webSocket) {
        this.webSocket = webSocket;
    }
}
