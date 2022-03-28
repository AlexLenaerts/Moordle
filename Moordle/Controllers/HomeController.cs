using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;
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
        public async Task<ActionResult> Word()
        {
            RandomWord word = await CreateRandomWord(5);
            WriteHttp(word.mot);
            return View(Index());
        }

        [Route("definition")]
        public async Task<ActionResult> Definition()
        {
            var definition = await GetWord(Request.QueryString["word"]);
            WriteHttp(definition.definition);
            return View(Index());
        }

        [Route("check")]
        public async Task<ActionResult> Check()
        {
            var check = await GetWord(Request.QueryString["word"]);
            WriteHttp(check);
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

        

        private async Task<T> CallAPI<T>(string url)
        {

            HttpClient client = new HttpClient();
            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            if (response.IsSuccessStatusCode)
            {
                var resp = await response.Content.ReadAsStringAsync();
                if (!resp.Contains("pas de résultats"))
                {
                    return JsonConvert.DeserializeObject<List<T>>(resp).First();
                }
            }
            return default;
        }

        private async Task<RandomWord> CreateRandomWord(int nbLetters)
        {
            var url = $@"https://api.dicolink.com/v1/mots/motauhasard?avecdef=true&minlong={nbLetters}&maxlong={nbLetters}&verbeconjugue=false&api_key=PFz6qrVmJRfueoxG27rA6BWNDwWSC2ER";
            return await CallAPI<RandomWord>(url);
        }
        private async Task<ResponseDicoLink> GetWord(string word)
        {
            var url = $@"https://api.dicolink.com/v1/mot/{word}/definitions?limite=1&api_key=PFz6qrVmJRfueoxG27rA6BWNDwWSC2ER";
           
            return await CallAPI<ResponseDicoLink>(url);
        }
    }
}
