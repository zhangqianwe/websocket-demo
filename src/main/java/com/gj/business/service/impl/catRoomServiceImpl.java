package com.gj.business.service.impl;

import com.gj.business.Entity.catRoom;
import com.gj.business.mapper.catRoomMapper;
import com.gj.business.service.ICatRoomService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-14 16:55
 * @Description:
 */
@Service
public class catRoomServiceImpl implements ICatRoomService {
    @Resource
    private catRoomMapper catRoomMapper;

    @Override
    public int insert(catRoom catRoom) {
        return catRoomMapper.insert(catRoom);
    }
}
