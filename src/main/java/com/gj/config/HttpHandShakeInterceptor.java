package com.gj.config;


import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * @auther Mr.Liao
 * @date 2019/3/22 18:20
 */
public class HttpHandShakeInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        System.out.println("【HttpHandShakeInterceptor-beforeHandshake方法】");
        ServletServerHttpRequest httpRequest = (ServletServerHttpRequest) request;
        HttpServletRequest servletRequest = httpRequest.getServletRequest();
        String sessionID = servletRequest.getSession().getId();
        System.out.println("【SessionId】------>"+sessionID);
        attributes.put("sessionID", sessionID);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        System.out.println("【HttpHandShakeInterceptor-afterHandshake方法】");
    }
}

