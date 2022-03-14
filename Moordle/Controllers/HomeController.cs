using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Hosting;
using System.Web.Mvc;
using Developpez.Dotnet;
using Newtonsoft.Json;
using System.Text.RegularExpressions;


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
            RandomWord word = CreateRandomWord(5);
            WriteHttp(word);
            
            return View(Index());
        }

        [Route("definition")]
        public async Task<ActionResult> Definition()
        {
            string pattern = @"([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))";
            string word = Request.QueryString["word"];
            var def = await GetDefiniton(word);
            Message message = new Message();
            if (!string.IsNullOrEmpty(def))
            {
                Match match = new Regex(pattern).Match(def);
                if (!string.IsNullOrEmpty(match.Value))
                {
                    message.Definition = def.Replace(match.Value, "");
                }
                else
                {
                    message.Definition = def;
                }
            }
            else
            {
                message.Definition = "Aucune définiton";
            }
            WriteHttp(message);
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
            string word = Request.QueryString["word"];
            var dic = GetFrenchDictionnay();
            Message message = new Message();

            if (!dic.Dico.Where(x => x.item == word.ToLower()).Any() || string.IsNullOrEmpty(word))
            {
                message.Error = "Entry word not found";
            }

            WriteHttp(message);

            return View(Index());
        }

        private async Task<string> GetDefiniton(string word)
        {
            var url = $@"https://frenchwordsapi.herokuapp.com/api/WordDefinition?idOrName=" + word;
            var response = await CallGetAPI<ResponseAPI>(url);

            if (response.Definition != null)
            {
                return response.Definition.First();
            }
            else
            {
                return string.Empty;
            }
        }

        private async Task<ResponseAPI> CallGetAPI<T>(string url)
        {
            HttpClient client = new HttpClient();
            var responseMessage = await client.GetAsync(url);
            if (responseMessage.IsSuccessStatusCode)
            {
                return JsonConvert.DeserializeObject<ResponseAPI>(await responseMessage.Content.ReadAsStringAsync());
            }
            else
            {
                return new ResponseAPI();
            }
        }

        public static RandomWord CreateRandomWord(int nbLetters)
        {
            Random rnd = new Random();
            var dic = GetFrenchDictionnay();
            var word = dic.Dico.Where(x => x.Length == nbLetters).ToArray();
            string randomString = $"{word[rnd.Next(0, word.Length)].item}";
            return new RandomWord { Random = randomString };
        }

        public static Dic GetFrenchDictionnay()
        {
           return (JsonConvert.DeserializeObject<Dic>(System.IO.File.ReadAllText(HostingEnvironment.ApplicationPhysicalPath + "dico.json")));
        }


    }
}
