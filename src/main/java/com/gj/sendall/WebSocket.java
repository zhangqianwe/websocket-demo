package com.gj.sendall;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.gj.business.Entity.UsersDto;
import com.gj.business.Entity.businessTypeOfUserIdVo;
import com.gj.business.Entity.catRoom;
import com.gj.business.emm.redisGet;
import com.gj.business.service.IBusinessTypeOfUserIdService;
import com.gj.business.service.ICatRoomService;
import com.gj.business.service.IUsersService;
import com.gj.config.SocketChannelInterceptor;
import com.gj.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
/**
 *
 * groupId+"msg"是聊天记录
 * groupId+"userARR"是组里面的人
 * @auther: zqw
 * @date: 2019-10-17 09:17
 */

/**
 * @author shkstart
 * @create 2018-08-10 16:34
 */
@Slf4j
@Component
@ServerEndpoint("/websocket/{userId}/{typeId}")
public class WebSocket {

    private Logger logger = LoggerFactory.getLogger(this.getClass());
    private static RedisUtil redisUtil;
    private static ApplicationContext applicationContext;

    public static void setApplicationContext(ApplicationContext applicationContext) {
        WebSocket.applicationContext = applicationContext;
    }

    private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    //    long lt = new Long(s);
//
//    Date date = new Date(lt);
//
//    res = simpleDateFormat.format(date);
    private IUsersService usersService;


    private IBusinessTypeOfUserIdService businessTypeOfUserIdService;

    private ICatRoomService catRoomService;

    @Autowired
    private SocketChannelInterceptor socketChannelInterceptor;


    /**
     * 在线人数
     */
    private static final AtomicInteger onlineNumber = new AtomicInteger(0);
    /**
     * 以用户的姓名为key，WebSocket为对象保存起来-在线人
     */
    private static Map<Integer, Session> UserIdAndSession = new ConcurrentHashMap<Integer, Session>();
    /**
     * 以用户的type为key，value session保存 接入但是没有客服的人
     * type
     * { "1": {
     * userId:session
     * "1":"session"
     * }
     * }
     */
    private static Map<Integer, List<HashMap<String, Session>>> NoCustomerSession = new ConcurrentHashMap<Integer, List<HashMap<String, Session>>>();
//    private static Map<Integer, Session> NoCustomerSession = new ConcurrentHashMap<Integer, Session>();
    /**
     * 会话
     */
    private Session session;
    /**
     * 用户名称
     */
    private String username;

    /**
     * 建立连接
     *
     * @param session userId 咨询的用户id
     *                typeId 类型id
     */
    @OnOpen
    public void onOpen(@PathParam("userId") String userId, Session session, @PathParam("typeId") String typeId, @PathParam("groupId") String groupId) throws IOException {
        this.session = session;
        int online = onlineNumber.incrementAndGet();
        logger.info("有新连接加入！ 当前在线人数" + online);
        redisUtil = applicationContext.getBean(RedisUtil.class);
        usersService = applicationContext.getBean(IUsersService.class);
        businessTypeOfUserIdService = applicationContext.getBean(IBusinessTypeOfUserIdService.class);
        catRoomService = applicationContext.getBean(ICatRoomService.class);
        //查询创建链接的用户
        UsersDto usersDto = usersService.getuserById(Integer.valueOf(userId));
        logger.info("创建链接：" + JSONObject.toJSONString(usersDto));
        businessTypeOfUserIdVo voByTypeId = businessTypeOfUserIdService.findVoByTypeId(Integer.valueOf(typeId));
        //将这个用户储存到redis中，为了减少数据库访问
        //session为key 对象为value
        boolean redisSet = redisUtil.set(this.session.getId(), JSONObject.toJSONString(usersDto));
        //key为userId，value为Session
        UserIdAndSession.put(usersDto.getId(), this.session);
        //判断是否添加到内存中
        if (redisSet) {
            if (usersDto.getCustomerType() == 1) {
                logger.info("redis缓存增加sessionID：[" + this.session.getId() + "],客服名为：[" + usersDto.getNickname() + "]");
                UsersDto usersDto1 = usersService.getuserById(Integer.valueOf(voByTypeId.getCustomer_id()));
                redisUtil.set(this.session.getId(), JSONObject.toJSONString(usersDto1));
                //key为用户id，value为sessionID
//                redisUtil.set(String.valueOf(usersDto.getId()), this.session.getId());
                SysMemory.clients.put(this.session.getId(), usersDto.getNickname());
                NoCustomerSession.forEach((k, v) -> {
                    if (k == voByTypeId.getType_id()) {
                        ArrayList<HashMap<String, Session>> vHashMap = (ArrayList<HashMap<String, Session>>) v;
                        for (HashMap<String, Session> stringSessionHashMap : vHashMap) {
                            stringSessionHashMap.forEach((vHashMapK, vHashMapV) -> {
                                String uuid = vHashMapK.split(",")[1];
                                String msg = "您好！我是特优生客服-" + voByTypeId.getCustomer_id() + "，请问您有什么要咨询的吗？";
                                Map<String, String> haMap = new HashMap<>();
                                haMap.put("message", msg);
                                haMap.put("groupId", uuid);
                                haMap.put("fromUserId", voByTypeId.getCustomer_id().toString());
                                String format = simpleDateFormat.format(System.currentTimeMillis());
                                haMap.put("time", format);
                                sendMessageTo(vHashMapV, JSONObject.toJSONString(haMap));
                                JSONArray jsonArray = JSONArray.parseArray((String) redisUtil.get(uuid));
                                HashMap<String, String> redisMap = new HashMap<>();
                                redisMap.put("message", haMap.get("message"));
                                redisMap.put("fromUserId", String.valueOf(voByTypeId.getCustomer_id()));
                                if (null != jsonArray) {
                                    jsonArray.add(redisMap);
                                    String s = JSON.toJSONString(jsonArray);
                                    redisUtil.set(uuid, s);
                                } else {
                                    List<HashMap<String, String>> object = new ArrayList<>();
                                    object.add(redisMap);
                                    String s = JSON.toJSONString(object);
                                    redisUtil.set(uuid, s);
                                }
                                String stringUserList = (String) redisUtil.get(uuid + "-" + redisGet.REDIS_USERARR);
                                JSONArray jsonArray1 = JSONArray.parseArray(stringUserList);
                                jsonArray1.add(voByTypeId.getCustomer_id());
                                boolean set = redisUtil.set(uuid + "-" + redisGet.REDIS_USERARR, JSONArray.toJSONString(jsonArray1));
                                String s1 = set == true ? "成功" : "失败";
                                logger.info("放入redis（uuid-customerId）：  " + s1 + " —--- " + uuid + "-" + redisGet.REDIS_USERARR);
                                Iterator<Integer> iterator = NoCustomerSession.keySet().iterator();
                                while (iterator.hasNext()) {
                                    Integer next = iterator.next();
                                    if (next == voByTypeId.getType_id()) {
                                        iterator.remove();
                                    }
                                }
                            });
                        }
                    }
                });
                return;
            }
            logger.info("redis缓存增加sessionID：【" + this.session.getId() + "】，咨询用户名为：【" + usersDto.getNickname() + "】");
            //根据typeId查询在线的客服

            //从内存中获取客服id的session
            Session customerSession = UserIdAndSession.get(voByTypeId.getCustomer_id());
            //如果客服没有在线。设置自动回复。
            JSONArray jsonArray = JSONArray.parseArray((String) redisUtil.get(groupId));
            if (null == customerSession) {
                //放入接入但是没有客服的人,这时候由客户创建分组id
                List<HashMap<String, Session>> ListSessionHashMap = new ArrayList<>();
                String sessionHashMapUserId = usersDto.getId().toString();
                String sessionHashMapUUID = UUID.randomUUID().toString().replace("-", "");
                Set<String> member_list = new HashSet<>();
                Set<String> DisplayNameList = new HashSet<>();
                member_list.add(sessionHashMapUserId);
                DisplayNameList.add(usersDto.getNickname());
                catRoom catRoom = new catRoom(null, sessionHashMapUUID, "", member_list.toString(), DisplayNameList.toString(), sessionHashMapUserId, "", "", 0);
                catRoomService.insert(catRoom);
                String sessionHashMapGroupId = sessionHashMapUserId + "," + sessionHashMapUUID;
                List<HashMap<String, Session>> hashMaps = NoCustomerSession.get(Integer.valueOf(typeId));
                if (null != hashMaps) {
                    ListSessionHashMap = hashMaps;
                    HashMap<String, Session> sessionHashMap = new HashMap<>();
                    sessionHashMap.put(sessionHashMapGroupId, this.session);
                    ListSessionHashMap.add(sessionHashMap);
                } else {
                    HashMap<String, Session> sessionHashMap = new HashMap<>();
                    sessionHashMap.put(sessionHashMapGroupId, this.session);
                    ListSessionHashMap.add(sessionHashMap);
                }

                NoCustomerSession.put(Integer.valueOf(typeId), ListSessionHashMap);
                Map<String, String> msgHaMap = new HashMap<>();
                msgHaMap.put("message", "抱歉！现在没有客服在线，请留言,客服在线后，会给您回复！");
                msgHaMap.put("groupId", sessionHashMapUUID);
                msgHaMap.put("fromUserId", "0");
                msgHaMap.put("time", String.valueOf(System.currentTimeMillis()));
                sendMessageTo(this.session, JSONObject.toJSONString(msgHaMap));

                HashMap<String, String> redisMap = new HashMap<>();
                redisMap.put("message", "抱歉！现在没有客服在线，请留言,客服在线后，会给您回复！");
                redisMap.put("fromUserId", String.valueOf(voByTypeId.getCustomer_id()));
                redisMap.put("time", String.valueOf(System.currentTimeMillis()));
                List<HashMap<String, String>> object = new ArrayList<>();
                object.add(redisMap);
                String s = JSON.toJSONString(object);
                redisUtil.set(sessionHashMapUUID, s);
                boolean set = redisUtil.set(sessionHashMapUUID + "-" + redisGet.REDIS_USERARR, member_list.toString());
                String s1 = set == true ? "成功" : "失败";
                logger.info("放入redis（uuid-customerId）：  " + s1 + " —--- " + sessionHashMapUUID + "-" + voByTypeId.getCustomer_id());
//                logger.info("链接未客服的数组：【"+JSONObject.toJSONString(NoCustomerSession)+"】");
                System.out.println(NoCustomerSession);
                SysMemory.SessionSet.add(this.session);
                return;
            }
            //缓存中是否有

            if (null == jsonArray) {
                //在线创建组，群主为客服，
                groupId = UUID.randomUUID().toString().replace("-", "");
                Set<String> member_list = new HashSet<>();
                Set<String> DisplayNameList = new HashSet<>();

                List<String> userIdList = new ArrayList<>();
                List<String> userNameList = new ArrayList<>();
                userIdList.add(String.valueOf(voByTypeId.getCustomer_id()));
                userIdList.add(String.valueOf(usersDto.getId()));
                userNameList.add(String.valueOf(usersDto.getNickname()));
                userNameList.add(String.valueOf(voByTypeId.getCustomer_name()));
                createMemberList(member_list, userIdList);
                createDisplayNameList(DisplayNameList, userNameList);

                catRoom catRoom = new catRoom();
                catRoom.setGroupId(groupId);//群ID
//            catRoom.setChatRoomName(member_list.toString());
                catRoom.setMemberList(member_list.toString());
                catRoom.setDisplayNameList(DisplayNameList.toString());
//                catRoom.setChatRoomName("w32");
                catRoomService.insert(catRoom);
                String customerString = String.valueOf(voByTypeId.getCustomer_id());
                redisUtil.set(groupId + "-" + redisGet.REDIS_USERARR, member_list.toString());
            }

            //给当前创建链接的session发送消息。例如：您好！我是特优生客服001，请问您有什么要咨询的吗？
            Map<String, String> haMap = new HashMap<>();
            haMap.put("message", "您好！我是特优生客服-" + voByTypeId.getCustomer_id() + "，请问您有什么要咨询的吗？");
            haMap.put("groupId", groupId);
            haMap.put("fromUserId", voByTypeId.getCustomer_id().toString());
            haMap.put("time", String.valueOf(System.currentTimeMillis()));

            String stringUserList = (String) redisUtil.get(groupId + "-" + redisGet.REDIS_USERARR);
            JSONArray arrUser = JSONArray.parseArray(stringUserList);
            arrUser.forEach(userIds -> {
                Session userListSession = UserIdAndSession.get(userIds);
                if (userListSession.isOpen()) {
                    sendMessageTo(UserIdAndSession.get(userIds), JSONObject.toJSONString(haMap));
                }
            });


            HashMap<String, String> redisMap = new HashMap<>();
            redisMap.put("message", haMap.get("message"));
            redisMap.put("fromUserId", String.valueOf(voByTypeId.getCustomer_id()));
            redisMap.put("time", String.valueOf(System.currentTimeMillis()));
            if (null != jsonArray) {
                jsonArray.add(redisMap);
                String s = JSON.toJSONString(jsonArray);
                redisUtil.set(groupId, s);
            } else {
                List<HashMap<String, String>> object = new ArrayList<>();
                object.add(redisMap);
                String s = JSON.toJSONString(object);
                redisUtil.set(groupId, s);
            }
            SysMemory.clients.put(this.session.getId(), usersDto.getNickname());

            SysMemory.SessionSet.add(this.session);
            //用户主动连的时候，服务器主动推送一条消息
        } else {
            onError(this.session, new RuntimeException("Redis异常！"));
            onClose();
        }

    }

    private void createDisplayNameList(Set<String> displayNameList, List<String> userIdList) {
        userIdList.forEach(userName -> {
            displayNameList.add(userName);
        });
    }

    private void createMemberList(Set<String> member_list, List<String> userList) {
        userList.forEach(userId -> {
            member_list.add(userId);
        });
    }

    @OnError
    public void onError(Session session, Throwable error) {
        logger.info("服务端发生了错误" + error.getMessage());
    }

    /**
     * 连接关闭
     */
    @OnClose
    public void onClose() {
        int andDecrement = onlineNumber.decrementAndGet();
        logger.info("有连接关闭！ 当前在线人数" + andDecrement);
        String Vo = (String) redisUtil.get(this.session.getId());
        Integer id = (Integer) JSONObject.parseObject(Vo).get("id");
        logger.info("删除之前");
//        logger.info(JSONArray.toJSONString(UserIdAndSession));
        logger.info("在线人数 ： " + UserIdAndSession.size());
        if (UserIdAndSession.containsKey(id)) {
            String sessionVo = (String) redisUtil.get(this.session.getId());
            String userSession = JSONObject.parseObject(sessionVo).get("id").toString();
            Iterator<Integer> iterator = UserIdAndSession.keySet().iterator();
            while (iterator.hasNext()) {
                Integer next = iterator.next();
                if (next == id) {
                    iterator.remove();
                }
            }
            logger.info("删除之后");
//            Session remove = UserIdA。ndSession.remove(userSession);

            logger.info("在线人数： " + UserIdAndSession.size());
            logger.info("UserIdAndSession缓存删除sessionID：" + this.session.getId());
            redisUtil.del(this.session.getId());
            logger.info("redis缓存删除sessionID：" + this.session.getId());

            SysMemory.clients.remove(this.session.getId());
            SysMemory.SessionSet.remove(this.session);

        }

    }

    /**
     * 收到客户端的消息
     *
     * @param message 消息
     * @param session 会话
     */
    @OnMessage
    public void onMessage(String message, Session session, @PathParam(value = "typeId") String typeId, @PathParam(value = "userId") String userId) {
        try {
//            socketChannelInterceptor.postSend(message);
            JSONObject jsonObject = JSONObject.parseObject(message);
            String msg = (String) jsonObject.get("smg");
            String grouId = (String) jsonObject.get("groupId");
            if (StringUtils.isBlank(grouId)) {
                logger.info("来自客户端消息：为指定组！");
                Map<String, String> haMap = new HashMap<>();
                haMap.put("message", "来自客户端消息：为指定聊天组！");
                haMap.put("groupId", grouId);
                haMap.put("fromUserId", "0");
                haMap.put("time", String.valueOf(System.currentTimeMillis()));
                sendMessageTo(this.session, JSONObject.toJSONString(haMap));
                return;
            }
//            String grouId = "d842fdc1cc91404f81de1ada45eb53c3";
//            String msg = (String) jsonObject.get("messageContent");
            //打开链接的时候应该服务器主动给他推
//            logger.info("来自客户端消息：" + msg + "用户:" + SysMemory.clients.get(session.getId()) + "发给组id为" + grouId + "，客户端的id是：" + session.getId());
            logger.info("来自客户端消息：[" + msg + "] 用户:[" + SysMemory.clients.get(session.getId()) + "],发给组id为[" + grouId + "]，客户端的id是：[" + session.getId() + "]");
            businessTypeOfUserIdVo voByTypeId = businessTypeOfUserIdService.findVoByTypeId(Integer.valueOf(typeId));

            JSONArray jsonArray = JSONArray.parseArray((String) redisUtil.get(grouId));
            String uservo = (String) redisUtil.get(this.session.getId());
            //给当前创建链接的session发送消息。例如：您好！我是特优生客服001，请问您有什么要咨询的吗？
            Map<String, String> haMap = new HashMap<>();
            haMap.put("message", msg);
            haMap.put("groupId", grouId);
            haMap.put("fromUserId", JSONObject.parseObject(uservo).get("id").toString());
            haMap.put("time", String.valueOf(System.currentTimeMillis()));
//            sendMessageTo(this.session, JSONObject.toJSONString(haMap));

            HashMap<String, String> redisMap = new HashMap<>();
            redisMap.put("message", haMap.get("message"));
            redisMap.put("fromUserId", JSONObject.parseObject(uservo).get("id").toString());
            redisMap.put("time", String.valueOf(System.currentTimeMillis()));
            if (null != jsonArray) {
                jsonArray.add(redisMap);
                String s = JSON.toJSONString(jsonArray);
                redisUtil.set(grouId, s);
            } else {
                List<HashMap<String, String>> object = new ArrayList<>();
                object.add(redisMap);
                String s = JSON.toJSONString(object);
                redisUtil.set(grouId, s);
            }

            String stringUserList = (String) redisUtil.get(grouId + "-" + redisGet.REDIS_USERARR);
            JSONArray arrUser = JSONArray.parseArray(stringUserList);
            arrUser.forEach(listuserId -> {
                Session userListSession = UserIdAndSession.get(listuserId);
                if (userListSession.isOpen()) {
                    sendMessageTo(UserIdAndSession.get(listuserId), JSONObject.toJSONString(haMap));
                }
            });
//            Map<String, Object> map1 = new HashMap<String, Object>();
//            map1.put("messageType", 4);
//            map1.put("textMessage", message);
//            map1.put("fromusername", SysMemory.clients.get(session.getId()).getName());
//            map1.put("time", System.currentTimeMillis());
        } catch (Exception e) {
            e.printStackTrace();
            logger.info("发生了错误了");
        }

    }

    /**
     * 功能描述: 给某个用户发消息
     *
     * @param: session session
     * @return: message 发送的消息
     * @auther: zqw
     * @date: 2019-10-14 16:10
     */
    public void sendMessageTo(Session session, String message) {
        session.getAsyncRemote().sendText(message);
    }

    /**
     * api给组发送消息
     * @param groupId [组id]
     * @param message [消息]
     */
    public static Boolean sendMessageToOne(String groupId, String message) {
        Session session = null;
        String redisUserArr = (String)redisUtil.get(groupId+"-"+redisGet.REDIS_USERARR);
        if (null!=redisUserArr){
            JSONArray jsonArray = JSONArray.parseArray(redisUserArr);
            for (Object userId : jsonArray) {
                session = UserIdAndSession.get(userId);
            }
        }
        if (session != null) {
            session.getAsyncRemote().sendText(message);
            Object parse = JSONObject.parse(message);
            JSONArray jsonArray = JSONArray.parseArray((String) redisUtil.get(groupId));
            if (null != jsonArray) {
                jsonArray.add(parse);
                String s = JSON.toJSONString(jsonArray);
                redisUtil.set(groupId, s);
            } else {
                List<HashMap<String, String>> object = new ArrayList<>();
                object.add((HashMap<String, String>) parse);
                String s = JSON.toJSONString(object);
                redisUtil.set(groupId, s);
            }
        } else {
            log.info("没有找到相应的会话！");

            return false;
        }
        return true;
    }
//    public void sendMessageAll(String message, String FromUserName) {
//
//    }


}