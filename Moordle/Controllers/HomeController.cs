using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Hosting;
using System.Web.Mvc;
using Developpez.Dotnet;
using Newtonsoft.Json;

namespace Moordle.Controllers
{
    public class HomeController : Controller
    {

        public ActionResult Index()
        {
            return View();
        }

        [Route("word")]
        public ActionResult Word()
        {
            Word word = CreateRandomWord(5);
            WriteHttp(word);
            
            return View(Index());
        }

        private void WriteHttp(object obj)
        {
            string json = JsonConvert.SerializeObject(obj);

            Response.Clear();
            Response.ContentType = "application/json; charset=utf-8";
            Response.Write(json);
            Response.End();
        }

        [Route("check")]

        public ActionResult Check()
        {
            string param1 = Request.QueryString["word"];
            var dic = GetFrenchDictionnay();
            Message message = new Message();

            if (!dic.Where(x => x.Length == 5).Contains(param1.ToLower()))
            {
                message.Error = "Entry word not found";
            }

            WriteHttp(message);

            return View(Index());
        }


        public static Word CreateRandomWord(int nbLetters)
        {
            Random rnd = new Random();
            var dic = GetFrenchDictionnay();
            var word = dic.Where(x => x.Length == nbLetters).ToArray();
            string randomString = $"{word[rnd.Next(0, word.Length)]}";
            return new Word { RandomWord = StringExtensions.RemoveDiacritics(randomString) };
        }

        public static List<string> GetFrenchDictionnay()
        {
            string filePath = HostingEnvironment.ApplicationPhysicalPath + "dico.txt";
            List<string> linesList = new List<string>();
            string[] fileContent = System.IO.File.ReadAllLines(filePath);
            linesList.AddRange(fileContent);
            var newList = linesList.Select(s => s.Replace(s, StringExtensions.RemoveDiacritics(s).ToLower())).ToList();
            return newList;
        }
    }
}
