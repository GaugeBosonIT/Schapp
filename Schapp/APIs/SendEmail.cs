using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Mail;
using System.Configuration;
using System.ServiceModel;
using System.ServiceModel.Web;
using Schapp.Models;


namespace Schapp.APIs
{
    [ServiceContract]
    public class SendEmail
    {
       public string username = ConfigurationManager.AppSettings["username"].ToString();
       public string password = ConfigurationManager.AppSettings["password"].ToString();
       public string SmtpClient = ConfigurationManager.AppSettings["SmtpClient"].ToString();
       public string FromAddress = ConfigurationManager.AppSettings["FromAddress"].ToString();
       public string EmailSubject = ConfigurationManager.AppSettings["EmailSubject"].ToString();


       [OperationContract]
       [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, UriTemplate = "", ResponseFormat = WebMessageFormat.Json)]
       public Mail SendMail(Mail m)
        {
            MailMessage mail = new MailMessage();
            SmtpClient SmtpServer = new SmtpClient(SmtpClient);
            mail.From = new MailAddress(FromAddress);
            mail.To.Add(m.email);
            mail.Subject = EmailSubject;
            mail.Body = m.link;

            SmtpServer.Port = 587;
            SmtpServer.Credentials = new System.Net.NetworkCredential(username, password);
            SmtpServer.EnableSsl = true;

            SmtpServer.Send(mail);
            return m;
         }
            

    }
}