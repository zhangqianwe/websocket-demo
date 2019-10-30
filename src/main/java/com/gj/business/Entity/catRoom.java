package com.gj.business.Entity;

import java.io.Serializable;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-14 14:34
 * @Description:
 */
public class catRoom implements Serializable {

    private Integer id;
    //组id 64位字符串
    private String groupId;
    //房间名
    private String chatRoomName;

    //群组成员id列表，分号分割。a53255001;nan1242;jiabailo002
    private String memberList;

    //群成员昵称列表【中文顿号分割】海、二、老僧、刘伟、齐彬、毛、Echo、曹
    private String displayNameList;

    //群主id
    private String roomOwner;

    //自己在群里的自定义群昵称
    private String selfDisplayName;

    //群昵称，没有自定义群昵称则从display_name中截取20个字符作为群昵称。
    private String chatRoomNick;

    private Integer dr =0;


    public String getChatRoomName() {
        return chatRoomName;
    }

    public void setChatRoomName(String chatRoomName) {
        this.chatRoomName = chatRoomName;
    }

    public Integer getDr() {
        return dr;
    }

    public void setDr(Integer dr) {
        this.dr = dr;
    }

    public String getMemberList() {
        return memberList;
    }

    public void setMemberList(String memberList) {
        this.memberList = memberList;
    }

    public String getDisplayNameList() {
        return displayNameList;
    }

    public void setDisplayNameList(String displayNameList) {
        this.displayNameList = displayNameList;
    }

    public String getRoomOwner() {
        return roomOwner;
    }

    public void setRoomOwner(String roomOwner) {
        this.roomOwner = roomOwner;
    }

    public String getSelfDisplayName() {
        return selfDisplayName;
    }

    public void setSelfDisplayName(String selfDisplayName) {
        this.selfDisplayName = selfDisplayName;
    }

    public String getChatRoomNick() {
        return chatRoomNick;
    }

    public void setChatRoomNick(String chatRoomNick) {
        this.chatRoomNick = chatRoomNick;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public catRoom(Integer id, String groupId, String chatRoomName, String memberList, String displayNameList, String roomOwner, String selfDisplayName, String chatRoomNick, Integer dr) {
        this.id = id;
        this.groupId = groupId;
        this.chatRoomName = chatRoomName;
        this.memberList = memberList;
        this.displayNameList = displayNameList;
        this.roomOwner = roomOwner;
        this.selfDisplayName = selfDisplayName;
        this.chatRoomNick = chatRoomNick;
        this.dr = dr;
    }
    public catRoom(){};
}
