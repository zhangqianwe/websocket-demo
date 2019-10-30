/**
 * @文件名: LoginModel.java
 * @包名: com.sh.system.model
 * @描述: (用一句话描述该文件做什么)
 * @作者: Y.P
 * @日期: 2016年9月12日
 * @版本: V1.0
 */
package com.gj.business.Entity;

import java.io.Serializable;

public class LoginModel implements Serializable {

	/** 
	 * @Fields serialVersionUID : (用一句话描述这个变量表示什么)
	 */ 
	private static final long serialVersionUID = 1L;

	/** 用户登录名  */
	private String userName = null;

	/** 用户密码 */
	private String pwd = null;

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPwd() {
		return pwd;
	}

	public void setPwd(String pwd) {
		this.pwd = pwd;
	}
}
