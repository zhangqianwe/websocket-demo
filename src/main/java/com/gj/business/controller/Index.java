package com.gj.business.controller;

import lombok.extern.java.Log;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-23 09:14
 * @Description:
 */
@Controller
@Log
public class Index {
    @RequestMapping("/index")
    public String index() {
        try {
            log.info("跳转到首页");
            //通过Model进行对象数据的传递
//            HttpSession session = request.getSession();
//            session.setAttribute("username", name);
            return "index";
        } catch (Exception e) {
            log.info("跳转到websocket的页面上发生异常，异常信息是：" + e.getMessage());
            return "error";
        }
    }
}
