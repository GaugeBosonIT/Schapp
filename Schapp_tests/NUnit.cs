using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using NUnit.Framework;
using Schapp.Controllers;

namespace AudioTag
{
    [TestFixture]
    public class NUnit
    {
        [Test]
        public void Index_action_returns_a_view()
        {
            //arrange
            var c = new HomeController();
            //act
            var i = c.Index();
            //assert
            Assert.AreEqual("not equal at all", "", "Index view wrongly named");



        }

    }
}