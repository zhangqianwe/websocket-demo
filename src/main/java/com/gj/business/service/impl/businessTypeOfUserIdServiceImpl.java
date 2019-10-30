package com.gj.business.service.impl;

import com.gj.business.Entity.businessTypeOfUserIdVo;
import com.gj.business.mapper.businessTypeOfUserId;
import com.gj.business.service.IBusinessTypeOfUserIdService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-14 15:59
 * @Description:
 */
@Service
public class businessTypeOfUserIdServiceImpl implements IBusinessTypeOfUserIdService {
    @Resource
    private businessTypeOfUserId businessTypeOfUserId;

    @Override
    public businessTypeOfUserIdVo findVoByTypeId(Integer typeId) {
        return businessTypeOfUserId.findVoByTypeId(typeId);
    }
}
