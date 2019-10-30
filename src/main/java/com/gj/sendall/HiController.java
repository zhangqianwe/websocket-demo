package com.gj.sendall;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.websocket.Session;

@Controller
public class HiController {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * 会话
     */
    private Session session;
    /**
     * 用户名称
     */
    private String username;


    @RequestMapping("/websocket/{name}")
    public String webSocket(@PathVariable String name, Model model, HttpServletRequest request) {
        try {
            logger.info("跳转到websocket的页面上");
            //通过Model进行对象数据的传递
            HttpSession session = request.getSession();
            session.setAttribute("username", name);
            return "张潭咨询";
        } catch (Exception e) {
            logger.info("跳转到websocket的页面上发生异常，异常信息是：" + e.getMessage());
            return "error";
        }
    }

//    @RequestMapping("/getOnline")
//    @ResponseBody
//    public ModelMap getONline(HttpServletRequest request) {
//        ModelMap modelMap = new ModelMap();
//        String userName = request.getParameter("userName");
//        WebSocketClient client = null;
//        try {
//            client = new WebSocketClient(new URI("ws://localhost:8091/websocket/"+userName), new Draft_6455()) {
//                @Override
//                public void onOpen(ServerHandshake serverHandshake) {
//                    logger.info("握手成功");
//
//                }
//
//                @Override
//                public void onMessage(String msg) {
//                    logger.info("收到消息==========" + msg);
//
//                }
//
//                @Override
//                public void onClose(int i, String s, boolean b) {
//                    logger.info("链接已关闭");
//                }
//
//                @Override
//                public void onError(Exception e) {
//                    e.printStackTrace();
//                    logger.info("发生错误已关闭");
//                }
//            };
//        } catch (URISyntaxException e) {
//            e.printStackTrace();
//            System.out.println("发生错误！");
//        }
//        client.connect();
//        while(!client.getReadyState().equals(WebSocket.READYSTATE.OPEN)){
//            logger.info("正在连接...");
//        }
//        return modelMap;
//    }

}