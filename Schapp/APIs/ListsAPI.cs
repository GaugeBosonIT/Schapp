using System.ServiceModel;
using System.ServiceModel.Web;
using Schapp.Models;
using System.Collections.Generic;
using Schapp.Models;
using Schapp.DataAccess;
using System.IO;
using System.Runtime.Serialization;


namespace Schapp.APIs
{

    [ServiceContract]
    public class ListsAPI
    {
        [OperationContract]
        [WebGet(UriTemplate = "/{l}", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        public SList Get(string link)
        {
            SList l = new SList();
            l.link = link;
            SList rl = (SList)orm.GetObject(l);
            return rl;
        }

        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, UriTemplate = "/{l}", BodyStyle = WebMessageBodyStyle.WrappedRequest)]
        public SList Update(SList r)
        {
          return (SList)orm.SetObject(r).o;
         }

        [OperationContract]
        [WebInvoke(Method = "PUT", RequestFormat = WebMessageFormat.Json, UriTemplate = "", BodyStyle = WebMessageBodyStyle.WrappedRequest)]
        public SList Create(SList r)
        {
           return (SList)orm.SetObject(r).o;

        }



    }

}