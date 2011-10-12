using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;
using System.Runtime.Serialization;

namespace Schapp.Models
{
        
        [Serializable]
        public class RESULT
        {

            [XmlAttribute("proc_name")]
            public string proc_name { get; set; }

            [XmlAttribute("status")]
            public int status { get; set; }

            [XmlElement("LIST")]
            public SList l { get; set; }

        }
        [DataContract]
        [Serializable]
        public class SList
        {
            [DataMember]
            [XmlAttribute("name")]
            public string name { get; set; }

            [DataMember]
            [XmlAttribute("link")]
            public string link { get; set; }

            [DataMember]
            [XmlElement("ITEM")]
            public Item[] item { get; set; }
        }

        [Serializable]
        public class Item
        {
            [XmlAttribute("price")]
            public int price { get; set; }

            [XmlAttribute("shop")]
            public string shop { get; set; }

        }


}