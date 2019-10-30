package com.gj.business.service.impl;

import com.gj.business.Entity.UsersDto;
import com.gj.business.mapper.usersMapper;
import com.gj.business.service.IUsersService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-09-20 14:24
 * @Description:
 */
@Service
public class userServiceImpl implements IUsersService {
    @Resource
    private usersMapper userMapper;

    public List<UsersDto> getUser() {
        return userMapper.getUser();
    }

    @Override
    public UsersDto getuserById(Integer userId) {
        return userMapper.getuserById(userId);
    }

    @Override
    public UsersDto login(String loginName) {
        return userMapper.login(loginName);
    }
}
