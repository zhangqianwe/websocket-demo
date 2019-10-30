package com.gj.business.Entity;

import java.io.Serializable;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-14 15:05
 * @Description:
 */
public class businessTypeOfUserIdVo implements Serializable {

    private Integer id;

    private Integer customer_id;

    private String customer_name;


    private Integer type_id;

    private Integer dr;

    public Integer getDr() {
        return dr;
    }

    public void setDr(Integer dr) {
        this.dr = dr;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCustomer_id() {
        return customer_id;
    }

    public void setCustomer_id(Integer customer_id) {
        this.customer_id = customer_id;
    }

    public Integer getType_id() {
        return type_id;
    }

    public void setType_id(Integer type_id) {
        this.type_id = type_id;
    }

    public String getCustomer_name() {
        return customer_name;
    }

    public void setCustomer_name(String customer_name) {
        this.customer_name = customer_name;
    }
}
