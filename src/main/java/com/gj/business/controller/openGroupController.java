package com.gj.business.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.gj.business.Entity.UsersDto;
import com.gj.business.service.IBusinessTypeOfUserIdService;
import com.gj.business.service.IUsersService;
import com.gj.sendall.SysMemory;
import com.gj.sendall.WebSocket;
import com.gj.sendall.vo;
import com.gj.util.RedisUtil;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.websocket.Session;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-12 15:58
 * @Description:
 */
@RequestMapping("/openGroupController")
@RestController
public class openGroupController {

    @Resource
    private IUsersService usersService;
    @Resource
    private RedisUtil redisUtil;
    @Resource
    private IBusinessTypeOfUserIdService businessTypeOfUserIdService;
//    private static ApplicationContext applicationContext;
//    public static void setApplicationContext(ApplicationContext applicationContext) {
//        openGroupController.applicationContext = applicationContext;
//    }

    @RequestMapping(value = "/getIndex",method = RequestMethod.POST)
    @ResponseBody
    public ModelMap getIndex() {
        ModelMap modelMap = new ModelMap();
        List<UsersDto> user = usersService.getUser();
//        Map<String, vo> clients = SysMemory.clients;
        modelMap.put("user",user);
//        modelMap.put("clients",clients);
        redisUtil.set("2",modelMap);
        modelMap.put("success",true);
        return modelMap;
    }
    @RequestMapping(value = "/getRedis",method = RequestMethod.POST)
    @ResponseBody
    public ModelMap getRedis(HttpServletRequest request) {
//        if (exception){
//            throw new Error("throw error!");
//        }

        ModelMap modelMap = new ModelMap();
//        List<UsersDto> user = usersService.getUser();
//        Map<String, vo> clients = SysMemory.clients;
//        modelMap.put("user",user);
//        modelMap.put("clients",clients);
//        modelMap.put("count",redisUtil.get("1bfe1131fb3245a1b9dc20035c7452e4"));
        String groupId = request.getParameter("groupId");
        String id = request.getParameter("id");
        HttpSession session1 = request.getSession();
//        redisUtil
        Map<String, String> haMap = new HashMap<>();
        haMap.put("message", "api发送");
        haMap.put("groupId", groupId);
        haMap.put("fromUserId", "-1");
        haMap.put("time", String.valueOf(System.currentTimeMillis()));

        Boolean aBoolean = WebSocket.sendMessageToOne(groupId, JSONObject.toJSONString(haMap));
        String o = (String)redisUtil.get(groupId);
        JSONArray jsonArray = JSONArray.parseArray(o);
        List<Object> c = new ArrayList<>();
        for (Object o1 : jsonArray) {
            c.add(o1);
        }
        modelMap.put("list",c);
        String msg = aBoolean == true ? "发送成功" : "发送失败";
        modelMap.put("msg",msg);
        modelMap.put("success",true);
        return modelMap;
    }


}
