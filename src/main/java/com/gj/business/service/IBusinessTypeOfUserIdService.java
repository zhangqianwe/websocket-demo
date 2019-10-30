package com.gj.business.service;

import com.gj.business.Entity.businessTypeOfUserIdVo;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-14 15:59
 * @Description:
 */
public interface IBusinessTypeOfUserIdService {
    businessTypeOfUserIdVo findVoByTypeId(Integer typeId);
}
