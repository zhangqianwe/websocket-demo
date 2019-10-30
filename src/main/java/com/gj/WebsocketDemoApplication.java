package com.gj;

import com.gj.business.controller.openGroupController;
//import com.gj.config.WebSocketConfig;
import com.gj.sendall.WebSocket;
import org.java_websocket.server.WebSocketServer;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
@MapperScan("com.gj.business.mapper")
public class WebsocketDemoApplication {

    public static void main(String[] args) {
//        SpringApplication.run(WebsocketDemoApplication.class, args);

        SpringApplication springApplication = new SpringApplication(WebsocketDemoApplication.class);
        ConfigurableApplicationContext configurableApplicationContext = springApplication.run(args);
        WebSocket.setApplicationContext(configurableApplicationContext);

    }

}
