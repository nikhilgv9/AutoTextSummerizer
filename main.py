from StatisticsCollector import StatisticsCollector
from HtmlParagraphParse import HtmlParagraphParser

class main:
    #The entry point to this class(main) in Normal process flow
    #It reads the input file and delegates the control to StatisticsCollector class
    def summarize(self,file_name):
        print(file_name)
        l=file_name.split(".")
        fp=open(file_name)
        text=fp.read()
        fp.close()
        #Check whether type of file is TXT or HTML
        if l[len(l)-1]=="txt":
            self.paragraphs=self.getParagraphsFromTxt(text)
        elif l[len(l)-1].startswith("htm"):
            self.paragraphs=self.getParagraphsFromHtml(text)
        else:
            return
        #Create instance of StatisticsCollector and delegate control
        s=StatisticsCollector(self.paragraphs)
        keyWords=s.processParagraphs()
        return keyWords
    
    #Text files are split into paragraphs by checking the presence of a new line
    #character '\n'
    def getParagraphsFromTxt(self,text):
        l=[]
        tempList=text.split("\n")
        for i in tempList:
            #Eliminate empty paragraphs
            if i!="" and i!="\r": #TODO: need to be replaced with regular expression
                l.append(i)
        return l
    
    #HTML files are split into paragraphs with the help of HtmlParagraphParser class
    #See HtmlParagraphParser class
    def getParagraphsFromHtml(self,text):
        parser = HtmlParagraphParser()
        parser.feed(text)
        return parser.getData()


if __name__=="__main__":
    m=main()
    #file_name=raw_input("Enter the file name:")
    #file_name="input.txt"
    file_name="test.htm"
    m.summarize(file_name)
    