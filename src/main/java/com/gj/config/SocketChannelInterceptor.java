package com.gj.config;


import com.gj.sendall.WebSocket;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

/**
 * @auther Mr.Liao
 * @date 2019/3/22 19:43
 */
@Component
public class SocketChannelInterceptor implements ChannelInterceptor {
    /**
     * 在消息被实际发送到频道之前调用
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        System.out.println("【SocketChannelInterceptor-preSend方法】");
        return message;
    }
    /**
     * 在消息被实际发送之后,立即调用
     */
    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        System.out.println("【SocketChannelInterceptor-postSend方法】");
        // 消息头访问器
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(message);
        if (headerAccessor.getCommand() == null) return;
        String sessionID = headerAccessor.getSessionAttributes().get("sessionID").toString();
        switch (headerAccessor.getCommand()){
            case CONNECT:
                // 连接成功的处理
                connect(sessionID);
                break;
            case DISCONNECT:
                // 断开连接后的处理
                disconnect(sessionID);
                break;
            case SUBSCRIBE:
                break;
            case UNSUBSCRIBE:
                break;
        }

    }

    /**
     * 连接成功
     */
    private void connect(String sessionID){
        System.out.println("【SocketChannelInterceptor-连接成功】");
    }

    /**
     * 断开连接
     */
    private void disconnect(String sessionID){
        System.out.println("【SocketChannelInterceptor-断开连接】");
//        WebSocket.onlineUser.remove(sessionID);
    }

    /**
     * 总会执行，不管是否有异常发生，一般用于资源清理
     */
    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        System.out.println("【SocketChannelInterceptor-afterSendCompletion方法】");
    }
}


