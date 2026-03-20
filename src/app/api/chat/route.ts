import { NextRequest } from "next/server";
import { streamText,convertToModelMessages } from 'ai'
import { createDeepSeek } from "@ai-sdk/deepseek";
import APIKEY from "./key";
const deepSeek = createDeepSeek({
    apiKey: APIKEY, //设置API密钥
});
export async function POST(req: NextRequest) {
    const { messages } = await req.json(); //获取请求体
    //这里为什么接受messages 因为我们使用前端的useChat 他会自动注入这个参数，所有可以直接读取
    const convertedMessages = await convertToModelMessages(messages); // 等待Promise解析
     //前端传过来的额messages不符合sdk格式所以需要convertToModelMessages转换一下
        //转换之后的格式：
        //[
            //{ role: 'user', content: [ [Object] ] },
            //{ role: 'assistant', content: [ [Object] ] },
            //{ role: 'user', content: [ [Object] ] },
            //{ role: 'assistant', content: [ [Object] ] },
            //{ role: 'user', content: [ [Object] ] },
            //{ role: 'assistant', content: [ [Object] ] },
            //{ role: 'user', content: [ [Object] ] }
        //]
    const result = streamText({
        model: deepSeek('deepseek-chat'), //使用deepseek-chat模型
        messages:convertedMessages, //转换为模型消息

        system: '你是这个广州线上城市名片系统的ai机器人客服，请根据用户的问题给出回答', //系统提示词
    });
   
    return result.toUIMessageStreamResponse() //返回流式响应
}
