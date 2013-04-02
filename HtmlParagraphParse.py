from HTMLParser import HTMLParser

class HtmlParagraphParser(HTMLParser):
    
    def __init__(self):
        HTMLParser.__init__(self)
        self.paragraphs=[]
        self.foundP=False
        self.currentData=""
        
    def handle_starttag(self, tag, attrs):
        if tag=='p' or tag=='P':
            self.currentData=""
            self.foundP=True
            
    def handle_endtag(self, tag):
        if tag=='p' or tag=='P':
            if self.currentData!='':
                self.paragraphs.append(self.currentData)
            self.foundP=False
            
    def handle_data(self, data):
        self.currentData=self.currentData+data
        
    def printData(self):
        print(self.paragraphs)

    def getData(self):
        return self.paragraphs

if __name__=="__main__":
    parser = HtmlParagraphParser()
    file_name="test.htm"
    fp=open(file_name,"r")
    text=fp.read()
    fp.close()
    parser.feed(text)
    parser.printData()