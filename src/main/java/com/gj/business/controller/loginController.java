package com.gj.business.controller;

import com.gj.business.Entity.LoginModel;
import com.gj.business.Entity.UsersDto;
import com.gj.business.service.IUsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * @Auther: zhangqianwen
 * @Date: 2019-10-24 17:31
 * @Description:
 */
@Controller
@RequestMapping("/sys")
public class loginController {
    @Autowired
    private IUsersService iUsersService;
    @RequestMapping("/login")
    @ResponseBody
    public ModelMap login(LoginModel loginModel){

        ModelMap modelMap = new ModelMap();
        try {
            if (null == loginModel.getUserName() || "".equals(loginModel.getUserName())) {
                modelMap.addAttribute("code", 1);
                modelMap.addAttribute("success", false);
                modelMap.addAttribute("msg", "用户名不能为空！");

                return modelMap;
            }

            if (null == loginModel.getPwd() || "".equals(loginModel.getPwd())) {
                modelMap.addAttribute("code", 1);
                modelMap.addAttribute("success", false);
                modelMap.addAttribute("msg", "密码不能为空！");

                return modelMap;
            }
            UsersDto usersDto= iUsersService.login(loginModel.getUserName());
            if (null == usersDto) {
                modelMap.addAttribute("code", 1);
                modelMap.addAttribute("success", false);
                modelMap.addAttribute("msg", "用户不存在！");

                return modelMap;
            } /*else if (0 == usersDto.getServiceStatus()) {
                modelMap.addAttribute("code", 1);
                modelMap.addAttribute("success", false);
                modelMap.addAttribute("msg", "账号关闭！");

                return modelMap;
            } else if (null != userVo.getDefaultPwd() && 1 == userVo.getDefaultPwd()) {
                modelMap.addAttribute("code", 10001);
                modelMap.addAttribute("success", false);
                modelMap.addAttribute("msg", "请修改原始密码后登陆！");

                return modelMap;
            } else if (!MD5Util.MD5(loginModel.getPassword()).equals(userVo.getPassword())) {
                modelMap.addAttribute("code", 1);
                modelMap.addAttribute("success", false);
                modelMap.addAttribute("msg", "密码错误！");

                return modelMap;
            }*/
//
//            String  hql = "from UserRoleContactVo where status=1 and userId= "+userVo.getId()+"";
//            List<UserRoleContactVo> findByHql = userRoleContactDao.findByHql(hql, new Object[]{});
//
//            httpSession.setAttribute("NAS","");
//            for(int i = 0; i < findByHql.size(); i++){
//                if("scxsguanli".equals(findByHql.get(i).getRoleCode()) || "shichangxiaoshou".equals(findByHql.get(i).getRoleCode()) || "xiaoqufuzeren".equals(findByHql.get(i).getRoleCode())){
//                    Integer NAS = crmCustomerSaleDao.selectNoAccessNumber(userVo.getId());
//                    httpSession.setAttribute("NAS","今日共有"+NAS+"个客户需回访");
//                    break;
//                }
//            }
//            TeacherInvitationCodeVo teacherInvitationCodeVo = teacherInvitationCodeDao.findByUserId(userVo.getId());
//
//            String clientIp = ClientInfo.getIpAddr(request);
//            this.setHttpSession(httpSession, userVo, clientIp, teacherInvitationCodeVo);
//
//            modelMap.addAttribute("userId", Security.encrypt(userVo.getId()+""));
//
//            modelMap.addAttribute("invitCode", null != teacherInvitationCodeVo ? teacherInvitationCodeVo.getInvitationCode() : "");
            modelMap.addAttribute("name", usersDto.getNickname());
            modelMap.addAttribute("code", 0);
            modelMap.addAttribute("success", true);
            modelMap.addAttribute("msg", "登录成功！");
//
//            TimeDateUtil tdu = new TimeDateUtil();
//            logDao.saveLog(tdu, userVo, "登陆系统成功", clientIp);
        } catch (Exception e) {
            e.printStackTrace();
            modelMap.addAttribute("code", 1);
            modelMap.addAttribute("success", false);
            modelMap.addAttribute("msg", "系统错误！");
        } finally {
        }

        return modelMap;
    }
}
