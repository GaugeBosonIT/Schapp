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
            l.link = "1";
            SList rl = (SList)orm.GetObject(l);
            return rl;
        }

        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, UriTemplate = "/create/", BodyStyle = WebMessageBodyStyle.WrappedRequest)]
        public SList Create(SList r)
        {
            SList l = new SList();
            l.name = r.name;
            SList rl = (SList)orm.SetObject(l).o;
            return rl;
            //var lists = new List<SList>();
            //lists.Add(rl);
            //return lists;
        }



    }

}