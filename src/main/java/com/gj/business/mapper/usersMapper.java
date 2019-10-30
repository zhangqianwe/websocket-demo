package com.gj.business.mapper;

import com.gj.business.Entity.UsersDto;

import java.util.List;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-12 16:20
 * @Description:
 */
public interface usersMapper {
    List<UsersDto> getUser();

    UsersDto getuserById(Integer userId);

    UsersDto login(String loginName);
}
