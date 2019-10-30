package com.gj.business.mapper;

import com.gj.business.Entity.businessTypeOfUserIdVo;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-14 15:52
 * @Description:
 */
public interface businessTypeOfUserId {
    businessTypeOfUserIdVo findVoByTypeId(Integer typeId);
}
