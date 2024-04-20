import telebot
import random
from slovar import *
from telebot import types

bot = telebot.TeleBot('6610379452:AAEDifcSHUytiykNE3OmaoJl82EQP_g7cGw')
bot_send_photo = ""


@bot.message_handler(content_types=['text'])
def registr(message):
    msg = bot.send_message(message.chat.id, '������, ������ ���� ���')
    bot.register_next_step_handler(msg, fio_step)


def fio_step(message):
    user_info = {'name': message.text}
    msg = bot.send_message(message.chat.id, '������ ���� �������')
    bot.register_next_step_handler(msg, age_step, user_info)


def age_step(message, user_info):
    user_info['age'] = message.text
    print(user_info)


def get_city(message):
    # ������ ������
    keyboard = types.InlineKeyboardMarkup()
    # �� ������� ������� ����� � ���������� ��� ������� ������
    key_moscow = types.InlineKeyboardButton(text='������', callback_data='moscow')
    # ��������� ������ �� �����
    keyboard.add(key_moscow)
    key_piter = types.InlineKeyboardButton(text='����-���������', callback_data='piter')
    keyboard.add(key_piter)
    key_wol = types.InlineKeyboardButton(text='���������', callback_data='volgograd')
    keyboard.add(key_wol)
    key_astr = types.InlineKeyboardButton(text='���������', callback_data='astraxan')
    keyboard.add(key_astr)
    key_kaz = types.InlineKeyboardButton(text='������', callback_data='kazan')
    keyboard.add(key_kaz)
    key_vladik = types.InlineKeyboardButton(text='�����������', callback_data='vladivostok')
    keyboard.add(key_vladik)
    key_kalina = types.InlineKeyboardButton(text='�����������', callback_data='kaliningrad')
    keyboard.add(key_kalina)
    key_nn = types.InlineKeyboardButton(text='������ ��������', callback_data='nn')
    keyboard.add(key_nn)
    key_nows = types.InlineKeyboardButton(text='�����������', callback_data='novosibirsk')
    keyboard.add(key_nows)
    key_ekb = types.InlineKeyboardButton(text='������������', callback_data='ekb')
    keyboard.add(key_ekb)
    key_syzd = types.InlineKeyboardButton(text='�������', callback_data='syzdal')
    keyboard.add(key_syzd)
    # ���������� ��� ������ ����� � ����� ��������� � ������
    bot.send_message(message.from_user.id, text='� ������� ������ ���� �������, ��������������������� � ��������. '
                                                '������� ����� � ������� ������ ������.',
                     reply_markup=keyboard)


# ���������� ������� �� ������
@bot.callback_query_handler(func=lambda call: True)
def callback_worker(call):
    # ���� ������ �� ������, �� ������� ���������� � ������
    if call.data == "moscow":
        # ��������� �����
        bot_send_photo = random.choice(mos_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, mos)
        bot.send_photo(call.message.chat.id, bot_send_photo)
    elif call.data == "piter":
        bot_senda_photo = random.choice(pit_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, pit)
        bot.send_photo(call.message.chat.id, bot_senda_photo)
    elif call.data == "volgograd":
        bot_sent_photo = random.choice(volgograd_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, volgograd)
        bot.send_photo(call.message.chat.id, volgograd_photo)
    elif call.data == "volgograd":
        bot_sendb_photo = random.choice(volgograd_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, volgograd)
        bot.send_photo(call.message.chat.id, bot_sendb_photo)
    elif call.data == "astraxan":
        bot_sendc_photo = random.choice(astraxan_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, astraxan)
        bot.send_photo(call.message.chat.id, bot_sendc_photo)
    elif call.data == "kazan":
        bot_sendd_photo = random.choice(kazan_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, kazan)
        bot.send_photo(call.message.chat.id, bot_sendd_photo)
    elif call.data == "vladivostok":
        bot_sende_photo = random.choice(vladivostok_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, vladivostok)
        bot.send_photo(call.message.chat.id, bot_sende_photo)
    elif call.data == "kaliningrad":
        bot_sendf_photo = random.choice(kaliningrad_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, kaliningrad)
        bot.send_photo(call.message.chat.id, bot_sendf_photo)
    elif call.data == "nn":
        bot_sendg_photo = random.choice(nn_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, nn)
        bot.send_photo(call.message.chat.id, bot_sendg_photo)
    elif call.data == "novosibirsk":
        bot_sendh_photo = random.choice(novosibirsk_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, novosibirsk)
        bot.send_photo(call.message.chat.id, bot_sendh_photo)
    elif call.data == "ekb":
        bot_sendi_photo = random.choice(ekb_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, ekb)
        bot.send_photo(call.message.chat.id, bot_sendi_photo)
    elif call.data == "syzdal":
        bot_sendj_photo = random.choice(syzdal_photo)

        # ���������� ����� � ������
        bot.send_message(call.message.chat.id, syzdal)
        bot.send_photo(call.message.chat.id, bot_sendj_photo)


bot.polling(none_stop=True, interval=0)

