
import nltk
from nltk.corpus import stopwords
import numpy
from operator import itemgetter
from Statistics import Statistics

class StatisticsCollector:
    
    #TODO need to add enough debug messages to this class
    #Constructor, it requires a list of paragraphs (Strings) as parameter
    def __init__(self,paragraphs):
        self.REGEX_WHITE_SPACE=""
        self.CHARS_TO_STRIP=".\x92\x93\x94\x97'"
        self.paragraphs=paragraphs
        self.PARAGRAPH_MAGICLENGTH=self.findMagicLength() 
        self.IMPORTANT_FIRST_PARA_COUNT=4
        self.IMPORTANT_LAST_PARA_COUNT=2
        self.EXTRA_STOP_WORDS=['someone','something']
        
    
    #The Entry point to this (StatisticsCollector) Class
    def processParagraphs(self):
        allNouns=[]
        nounCountDictList=[]
        #The following loop identifies the count of each noun in each paragraph 
        #and creates a dictionary (nounCountDict) for each paragraphs
        #Each dictionary element is added to the list nounCountDictList
        #Another output of this loop is allNouns, 
        #which his the list is all nouns in all paragraphs,
        #it may contain duplicates at the end of this loop
        #Duplicates are removed using an elegant method (See:self.removeDuplicates() )
        for paragraph in self.paragraphs:
            sentenses=nltk.sent_tokenize(paragraph)
            tags=[]
            for sentens in sentenses:
                tokens=nltk.word_tokenize(sentens)
                tags.extend(nltk.pos_tag(tokens))
            nouns=self.getNouns(tags)
            filteredNouns=self.removeStopWords(nouns)
            allNouns.extend(filteredNouns)
            nounCountDict=self.getNounsCounts(filteredNouns)
            nounCountDictList.append(nounCountDict)
        allNouns=self.removeDuplicates(allNouns)
        
        #Creates occurrenceVector. See createOccurenceVector() for more details
        occurenceVectorDict=self.createOccurenceVector(allNouns,nounCountDictList)
        weightVectorDict=self.createNounWeightDict(occurenceVectorDict)
        numberOfParagraphs=len(self.paragraphs)
        pointList=[]
        for key in weightVectorDict.keys():
            totalOccurrences=sum(weightVectorDict[key])
            averageCount=totalOccurrences/numberOfParagraphs
            variance=numpy.var(weightVectorDict[key])
            #TODO: have to replace the following line with a better formula that balances mean and variance 
            point=averageCount-variance
            pointList.append((key,point))
        
        #Sort keywords according to weight
        pointList.sort(key=itemgetter(1),reverse=True)
        print(pointList)
        
        #Take most important 10 words
        keyWords=[]
        print("Important words")
        if len(pointList)>10:
            for i in range(0,10):
                keyWords.append(pointList[i][0])
        else:
            for i in range(0,len(pointList)):
                keyWords.append(pointList[i][0])
        
        s=Statistics()
        s.keywords=keyWords
        s.title=keyWords[0]
        
        '''
        Following code implements the paragraph scoring algorithm based of Eigan vectors of similarity matrix
        '''
        #Creating the similarity vector to find rate paragraphs
        similarityMatrix=[];
        for i in range(0,numberOfParagraphs):
            currentRow=[]
            for j in range(0,numberOfParagraphs):
                freq=0
                nounsInThisPara=0
                for k in allNouns:
                    currentOccurenceVector=occurenceVectorDict[k]
                    if currentOccurenceVector[i]>0:
                        nounsInThisPara=nounsInThisPara+1
                    if currentOccurenceVector[i]>0 and currentOccurenceVector[j]>0:
                        freq=freq+1
                if nounsInThisPara==0:
                    similarity=0
                else:
                    similarity=float(freq)/float(nounsInThisPara)
                currentRow.append(similarity)
            similarityMatrix.append(currentRow)
        
        print("Similarity Matrix")
        self.printMatrix(similarityMatrix)
        
        similarityArray=numpy.array(similarityMatrix)
        
        #Calculating eigan values of similarity matrix
        eigenvalues, eigenvectors = numpy.linalg.eig(similarityArray)
        
        #Only for the purpose of printing Eigan values
        print("Eigan Vectors")
        for i in range(0,numberOfParagraphs):
            print(self.paragraphs[i])
            print(eigenvectors[i])
            
        paragraphRatings=[];
        k=0
        for i in eigenvectors:
            count=0
            for j in i:
                if j>0.001: #checking for positive value
                    count=count+1
            paragraphRatings.append((count,k))
            k=k+1
        #The following lines are to locate the most important paragraph
        
        #Sort paragraphs according to rating
        paragraphRatings.sort(key=itemgetter(0),reverse=True)
        
        s.importantPara=self.paragraphs[paragraphRatings[0][1]]
        s.importantParaRating=paragraphRatings[0][0]
        return s
    
    #createOccurenceVector()
    #-------------------------
    #This method creates a dictionary, in which keys are nouns
    #Values corresponding to keys are lists which describes the number of occurrences 
    #of that noun in each paragraph
    #The output of this method is usually passed to createNounWeightDict() method
      
    def createOccurenceVector(self,allNouns,nounCountDictList):
        occurenceDict={}
        for noun in allNouns:
            l=[]
            for nounCountDict in nounCountDictList:
                lowerKeys=map(str.lower,nounCountDict.keys())
                if not noun.lower() in lowerKeys:
                    l.append(0)
                else:
                    l.append(nounCountDict[noun.lower()])
            occurenceDict[noun]=l
        return occurenceDict
    
    #removeStopWords
    #---------------
    #Remove the stop words from the passed in WordsList
    #Stop words are defined in stopwords.words('english')
    #Also in self.EXTRA_STOP_WORDS=['someone','something']
    def removeStopWords(self,wordsList):
        filreredNouns=[w for w in wordsList if not w.lower() in stopwords.words('english')]
        filreredNouns=[w for w in filreredNouns if not w.lower() in self.EXTRA_STOP_WORDS]
        return filreredNouns
    
    
    #createNounWeightDict
    #------------------------
    #Input: A Dictionary in which key is each noun
    #The value corresponding to each key is a list, which holds the number of occurrences
    #of each noun in each paragraph
    #Output: A Dictionary in which key is each noun
    #The value corresponding to each key is a list, which holds the weight
    #of each noun in each paragraph
    #Weight is different from number of occurrences
    #Weight is dependent on a lot of parameters like, paragraph's length, 
    #its importance and all
    def createNounWeightDict(self,nounCountDict):
        weighthedOccurenceDict={}
        for key in nounCountDict.keys():
            l=nounCountDict[key]
            weightList=[]
            for i in range(0,len(l)):
                count=l[i]
                credit=0
                importance=1;
                #To avoid the effect of paragraphs that are too small
                if len(self.paragraphs[i])<self.PARAGRAPH_MAGICLENGTH and i>=self.IMPORTANT_FIRST_PARA_COUNT:
                    if count<>0:
                        credit=-count
                #Occurrence in first paragraphs has higher weight
                elif i<self.IMPORTANT_FIRST_PARA_COUNT:
                    importance=3
                #Occurrence in last few paragraphs has higher weight
                elif i>=self.IMPORTANT_LAST_PARA_COUNT:
                    importance=2
                wordsInPara=len(nltk.word_tokenize(self.paragraphs[i]))
                w=float(importance*(count+credit))/float(wordsInPara)
                weightList.append(w)
            weighthedOccurenceDict[key]=weightList
            #print(key,weightList)
        return  weighthedOccurenceDict            
    
    #Margin length is the length, so that all paragraphs with length less than 
    #this are given little importance
    def findMagicLength(self):
        l=[]
        for paragraph in self.paragraphs:
            l.append(len(paragraph))
        meanLength=numpy.mean(l)
        magicLength=meanLength*.5
        return magicLength
    
    #A List of 2 tuples is passed to this function.
    #The first value in each tuple is the Word
    #the second value in each tuple is its TYPE (Noun or Verb etc...)
    #It returns a list of Nouns
    def getNouns(self,tags):
        l=[]
        for tag in tags:
            tagWord=tag[0]
            tagType=tag[1]
            if self.getTypeFromTag(tagType)=="NOUN":
                trippedWord=self.strip(tagWord)
                if trippedWord!='':     #TODO: need to be replaced with regular expression
                    l.append(trippedWord)
        return l;
    
    #Strip is to remove certain punctuation and junk characters that usually appear in words
    #These punctuation are listed in self.CHARS_TO_STRIP
    def strip(self,word):
        if not word.isalpha():
            w=word.strip(self.CHARS_TO_STRIP)
            if w.isalpha():
                return w
            else:
                return ''
        else:
            return word
    
    #This function gives the interpretation of tags added by Natural Language Tool Kit
    def getTypeFromTag(self,tagType):
        if tagType.startswith('NN'):
            return "NOUN"
        elif tagType.startswith('VB'):
            return "VERB"
        elif tagType.startswith('JJ'):
            return "ADJ"
        elif tagType.startswith('RB'):
            return "ADV"
        else:
            return ''

    #A list of nouns with repetition allowed is passed to this method
    #Usually the passed in nouns corresponds to the nouns in a paragraph
    #It creates a dictionary in which each noun is the key.
    #And the value is the number of occurrences of each word
    def getNounsCounts(self,nouns):
        nounCountDict={}
        for noun in nouns:
            keys=nounCountDict.keys()
            lowerKeys=map(str.lower,keys)
            if noun.lower() not in lowerKeys:
                nounCountDict[noun.lower()]=1
            else:
                nounCountDict[noun.lower()]=nounCountDict[noun.lower()]+1
        return nounCountDict
   
    #Even this function appears a little complicated. The task done by it is very simple
    #A better programmer may be able to reduce its length to some extend
    #From the passed in list of nouns it checks for
    def removeDuplicates(self,wordList):
        newList=[]
        i=0
        while i<len(wordList):
            flag=False
            allLower=False
            j=0
            c=wordList[i].lower()
            wordToAdd=""
            while j<len(wordList):
                if c==wordList[j].lower():
                    w=wordList.pop(j)
                    if not flag: 
                        flag=True
                    if not allLower:
                        wordToAdd=w
                    if w==c: #to see whether is is possible to exist for this word all lower case
                        wordToAdd=w
                        allLower=True        
                else:
                    j=j+1
            if not flag:
                i=i+1
            else:
                newList.append(wordToAdd)
        return newList

    #A utility function to print matrix
    def printMatrix(self,m):
        for i in m:
            print i

#To be executed only when directly executing this file.
#Used only for unit testing    
if __name__=="__main__":
    pass
    #m=main()
    #file_name="input2.txt"
    #m.summarize(file_name)
    