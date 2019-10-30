//package com.gj.config;
///**
// * @author shkstart
// * @create 2018-08-09 16:44
// */
//
//
//import com.alibaba.fastjson.JSON;
//import com.alibaba.fastjson.JSONObject;
//import com.gj.sendall.WebSocket;
//import com.gj.sendall.WebSocketHander;
//import com.gj.util.RedisUtil;
//import org.apache.commons.lang3.StringUtils;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.ApplicationContext;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.lang.Nullable;
//import org.springframework.messaging.Message;
//import org.springframework.messaging.MessageChannel;
//import org.springframework.messaging.MessageHeaders;
//import org.springframework.messaging.converter.MessageConverter;
//import org.springframework.messaging.converter.SimpleMessageConverter;
//import org.springframework.messaging.converter.SmartMessageConverter;
//import org.springframework.messaging.simp.SimpMessageType;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.messaging.simp.config.ChannelRegistration;
//import org.springframework.messaging.simp.config.MessageBrokerRegistry;
//import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
//import org.springframework.messaging.support.ChannelInterceptor;
//import org.springframework.messaging.support.ChannelInterceptorAdapter;
//import org.springframework.messaging.support.GenericMessage;
//import org.springframework.stereotype.Component;
//import org.springframework.stereotype.Service;
//import org.springframework.web.socket.config.annotation.*;
//
//import javax.annotation.Resource;
//import java.util.HashMap;
//import java.util.LinkedHashMap;
//import java.util.Map;
//import java.util.concurrent.LinkedBlockingQueue;
//import java.util.concurrent.ThreadPoolExecutor;
//import java.util.concurrent.TimeUnit;
//
//@Configuration
//@EnableWebSocketMessageBroker
////public class WebSocketConfig implements WebSocketConfigurer {
//    public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
//    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);
//    @Autowired
//    private SocketChannelInterceptor socketChannelInterceptor;
//
//    public void registerStompEndpoints(StompEndpointRegistry registry) {
//        //开启/myEndPoint端点
//        registry.addEndpoint("/websocket")
//                .addInterceptors(new HttpHandShakeInterceptor())
//                //允许跨域访问
//                .setAllowedOrigins("*")
//                //使用sockJS
//                .withSockJS();
//
//    }
//
//
//    /**
//     * 注册Channel拦截器
//     */
//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        log.info("注册Channel拦截器");
//        registration.interceptors(socketChannelInterceptor);
//
//
//    }
//
//
////    @Override
////    public void configureClientOutboundChannel(ChannelRegistration registration) {
////        System.out.println("注册Channel拦截器2");
////        registration.interceptors(new SocketChannelInterceptor());
////    }
//}
