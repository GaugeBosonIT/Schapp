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

            [XmlElement("SList")]
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
            [XmlElement("Item")]
            public Item[] item { get; set; }
        }
        [DataContract]
        [Serializable]
        public class Item
        {
            [DataMember]
            [XmlAttribute("price")]
            public int price { get; set; }

            [DataMember]
            [XmlAttribute("name")]
            public string name { get; set; }

            [DataMember]
            [XmlAttribute("shop")]
            public string shop { get; set; }

            [DataMember]
            [XmlAttribute("quantity")]
            public string quantity { get; set; }

        }


}