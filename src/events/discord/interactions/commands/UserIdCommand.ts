import {CommandInteraction, Interaction, MessageAttachment} from "discord.js";
import { dump } from "../../../../utils/CacheUtil";
import * as path from "path";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class UserIdCommand {
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()
    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'get_user_id') { return }

        const userArgument = interaction.options.getUser(this.syntaxLocale.commands.get_user_id.options.user.name)

        let answer

        if(userArgument === null) {
            answer = this.locale.messages.answers.own_id
                .replace(/\${id}/g, interaction.user.id)
        } else {
            answer = this.locale.messages.answers.other_id
                .replace(/\${id}/g, userArgument.id)
                .replace(/\${username}/g, userArgument.tag)
        }

        void interaction.reply(answer)
    }
}