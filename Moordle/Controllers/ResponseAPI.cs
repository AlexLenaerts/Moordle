using System.Collections.Generic;

namespace Moordle.Controllers
{
    internal class ResponseAPI
    {
        public string Id { get; set; }
        public string WordID { get; set; }
        public List<object> RelationWith { get; set; }
        public List<string> Categorie { get; set; }
        public List<string> Definition { get; set; }
    }
}