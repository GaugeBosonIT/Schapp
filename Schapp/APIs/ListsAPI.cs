using System.ServiceModel;
using System.ServiceModel.Web;
using Schapp.Resources;
using System.Collections.Generic;

namespace Schapp.APIs
{

    [ServiceContract]
    public class ListsAPI
    {

        [WebGet(UriTemplate = "")]
        public IEnumerable<List> Get()
        {
            var lists = new List<List>()
        {
            new List {Name = "Harry"},
            new List {Name = "Martin"},
 
        };
            return lists;
        }
    }
}