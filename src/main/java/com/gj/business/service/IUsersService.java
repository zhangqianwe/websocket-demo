package com.gj.business.service;

import com.gj.business.Entity.UsersDto;

import java.util.List;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-09-20 14:22
 * @Description:
 */
public interface IUsersService {
    List<UsersDto> getUser();

    UsersDto getuserById(Integer valueOf);

    UsersDto login(String loginName);
}
