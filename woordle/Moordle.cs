using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace woordle
{
    public static class Moordle
    {

        /// <summary>
        /// Creates the random word number combination.
        /// </summary>
        /// <returns>System.String.</returns>
        public static string CreateRandomWord(int nbLetters)
        {
            Random rnd = new Random();
            //Dictionary of strings
            //string[] words = { "Bold", "Think", "Friend", "Pony", "Fall", "Easy" };

            string filePath = @"C:\Users\Alexandre\Desktop\";
            List<string> linesList = new List<string>();
            string[] fileContent = System.IO.File.ReadAllLines(filePath + "dictionary.txt");
            linesList.AddRange(fileContent);
            var test = linesList.Where(x => x.Length == nbLetters).ToArray();
            string randomString = $"{test[rnd.Next(0, test.Length)]}";

            return randomString;

        }
    }
}
